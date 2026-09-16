import { NextResponse } from "next/server";
import { getCurrentUser } from "./session";
import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Ensures a request is authenticated. Optionally restricts to a set of roles.
 * Returns the current user; throws ApiError(401/403) otherwise.
 */
export async function requireUser(roles) {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Authentication required");
  if (roles && !roles.includes(user.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  return user;
}

/**
 * Ensures the current user owns (or is staff/employee of) a vendor tenant and
 * returns that Vendor document. This is the single choke point every
 * vendor-scoped API route must go through instead of trusting a vendorId
 * from the client.
 */
export async function requireVendorContext(user) {
  if (!user.vendor) throw new ApiError(403, "No business profile linked to this account");
  await connectDB();
  const vendor = await Vendor.findById(user.vendor);
  if (!vendor) throw new ApiError(404, "Vendor not found");
  return vendor;
}

export function handleApiError(err) {
  if (err instanceof ApiError) {
    return NextResponse.json({ success: false, message: err.message }, { status: err.status });
  }
  // Mongoose errors are common (a select left blank, a required field skipped,
  // a duplicate slug/email) and shouldn't surface as an opaque 500.
  if (err?.name === "CastError") {
    return NextResponse.json({ success: false, message: `Invalid value provided for "${err.path}"` }, { status: 400 });
  }
  if (err?.name === "ValidationError") {
    const message = Object.values(err.errors || {}).map((e) => e.message).join(", ") || "Validation failed";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
  if (err?.code === 11000) {
    return NextResponse.json({ success: false, message: "A record with this value already exists" }, { status: 409 });
  }
  console.error(err);
  return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
}
