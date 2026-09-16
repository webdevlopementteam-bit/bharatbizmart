import jwt from "jsonwebtoken";

// A silent fallback here would mean anyone can forge a valid session token
// (including a superadmin one) against a misconfigured deployment — fail
// loudly in production instead of ever running on a known, public secret.
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production — refusing to start with an insecure default.");
  }
  console.warn("[auth] JWT_SECRET is not set. Using an insecure dev-only default — set it before deploying.");
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
