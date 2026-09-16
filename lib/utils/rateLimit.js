// Rate limiter with two backends:
//  - Upstash Redis (REST API, no extra dependency — just fetch + a token)
//    when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set. This is
//    what makes limits correct across multiple server instances / serverless
//    invocations, which is required once this app runs as more than one
//    process — an in-memory Map is invisible to every other instance.
//  - An in-memory Map fallback for local dev / single-instance use, so the
//    app still works without any Redis setup.
//
// To go multi-instance in production: provision a free Upstash Redis
// database (https://upstash.com), and set UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN in the deployment's environment — no code change
// needed, this module picks it up automatically.

const buckets = new Map();
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasRedis = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

if (process.env.NODE_ENV === "production" && !hasRedis) {
  console.warn(
    "[rateLimit] No UPSTASH_REDIS_REST_URL/TOKEN set — falling back to an in-memory limiter. " +
    "This only rate-limits within a single instance; set up Upstash before running multiple instances."
  );
}

function memoryRateLimit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return { allowed: true, remaining: limit - 1 };
  }

  bucket.count += 1;
  if (bucket.count > limit) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: limit - bucket.count };
}

// Fixed-window counter via Redis INCR + EXPIRE, done as one pipelined REST
// call so it's a single round trip per request.
async function redisRateLimit(key, limit, windowMs) {
  const windowSeconds = Math.ceil(windowMs / 1000);
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", `ratelimit:${key}`],
      ["EXPIRE", `ratelimit:${key}`, String(windowSeconds), "NX"],
    ]),
  });
  if (!res.ok) throw new Error(`Upstash rate limit request failed: ${res.status}`);
  const [incrResult] = await res.json();
  const count = Number(incrResult?.result ?? 0);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}

/**
 * Rate-limit a logical key (e.g. `login:1.2.3.4`) to `limit` calls per
 * `windowMs`. Falls back to allowing the request (fail-open) if Redis is
 * configured but unreachable, so a transient Redis outage degrades to "no
 * rate limiting" rather than taking the whole API down.
 */
export async function rateLimitAsync(key, { limit = 10, windowMs = 60_000 } = {}) {
  if (!hasRedis) return memoryRateLimit(key, limit, windowMs);
  try {
    return await redisRateLimit(key, limit, windowMs);
  } catch (err) {
    console.error("[rateLimit] Redis backend error, failing open:", err.message);
    return memoryRateLimit(key, limit, windowMs);
  }
}

// Synchronous convenience wrapper for the many existing call sites that
// aren't (and don't need to be) async-aware — it always uses the in-memory
// bucket. Prefer `rateLimitAsync` in any route that can await it, since only
// that path is correct under multiple instances.
export function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  return memoryRateLimit(key, limit, windowMs);
}

export function clientIpFromRequest(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
