import { cookies } from "next/headers";
import { verifyToken, signToken } from "./jwt";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";

export const COOKIE_NAME = process.env.COOKIE_NAME || "bbm_token";

const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function buildAuthCookie(token) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

export function issueSessionToken(user) {
  return signToken({ sub: String(user._id), role: user.role, vendor: user.vendor ? String(user.vendor) : null });
}

/**
 * Reads the auth cookie in a server component / route handler and returns the
 * authenticated User document (without password hash), or null.
 * This is the ONLY source of truth for "who is the current user" — never
 * trust a userId/vendorId passed in the request body or query string.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload?.sub) return null;

  await connectDB();
  const user = await User.findById(payload.sub).lean();
  if (!user || user.status !== "active") return null;

  return user;
}

export async function getSessionPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
