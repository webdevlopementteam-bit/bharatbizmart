import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { issueSessionToken, buildAuthCookie } from "@/lib/auth/session";
import { ok, fail } from "@/lib/utils/api";
import { rateLimitAsync, clientIpFromRequest } from "@/lib/utils/rateLimit";

// Buyer self-registration. Sellers register via /api/vendors/register, which
// creates the User + Vendor + Website together.
export async function POST(request) {
  const { allowed } = await rateLimitAsync(`register:${clientIpFromRequest(request)}`, { limit: 5, windowMs: 60_000 });
  if (!allowed) return fail("Too many attempts. Please try again in a minute.", 429);

  const body = await request.json();
  const { name, email, phone, password } = body || {};

  if (!name || !email || !password) return fail("Name, email and password are required");
  if (password.length < 6) return fail("Password must be at least 6 characters");

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return fail("An account with this email already exists", 409);

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role: "buyer",
  });

  const token = issueSessionToken(user);
  const res = ok({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
  res.cookies.set(buildAuthCookie(token));
  return res;
}
