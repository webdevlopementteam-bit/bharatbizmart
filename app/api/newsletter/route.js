import { connectDB } from "@/lib/db/connect";
import Newsletter from "@/models/Newsletter";
import { ok, fail } from "@/lib/utils/api";
import { rateLimitAsync, clientIpFromRequest } from "@/lib/utils/rateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Homepage newsletter signup — a real subscriber list, not a decorative form.
export async function POST(request) {
  const { allowed } = await rateLimitAsync(`newsletter:${clientIpFromRequest(request)}`, { limit: 5, windowMs: 60_000 });
  if (!allowed) return fail("Too many attempts. Please try again shortly.", 429);

  const { email } = (await request.json()) || {};
  if (!email || !EMAIL_RE.test(email)) return fail("Enter a valid email address");

  await connectDB();
  await Newsletter.updateOne(
    { email: email.toLowerCase() },
    { $set: { status: "subscribed" } },
    { upsert: true }
  );

  return ok({ subscribed: true }, { status: 201 });
}
