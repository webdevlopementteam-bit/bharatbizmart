import { NextResponse } from "next/server";

export function ok(data, init) {
  return NextResponse.json({ success: true, ...data }, init);
}

export function fail(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export function getPagination(searchParams, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(searchParams.get("limit") || String(defaultLimit), 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildMeta({ page, limit, total }) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/**
 * A <select> with an unselected "optional" ObjectId field (category, etc.)
 * posts "" rather than omitting the key, which Mongoose can't cast and would
 * otherwise throw a raw CastError. Strip those fields down to undefined so
 * "left blank" is treated the same as "not provided".
 */
export function stripEmptyRefs(body, fields) {
  const cleaned = { ...body };
  for (const field of fields) {
    if (cleaned[field] === "") cleaned[field] = undefined;
  }
  return cleaned;
}

/**
 * Mass-assignment guard: an update route that does `{ $set: body }` with a
 * raw client body lets the caller overwrite ANY schema field — including ones
 * that gate money or trust (isFeatured, vendor ownership, verification
 * status, view/enquiry counters). Route handlers that accept a body for
 * $set must pass it through this first with an explicit allowlist.
 */
export function pickFields(body, allowedKeys) {
  const picked = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(body, key)) picked[key] = body[key];
  }
  return picked;
}
