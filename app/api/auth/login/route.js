import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { verifyPassword } from "@/lib/auth/password";
import { issueSessionToken, buildAuthCookie } from "@/lib/auth/session";
import { ok, fail } from "@/lib/utils/api";
import { rateLimitAsync, clientIpFromRequest } from "@/lib/utils/rateLimit";

export async function POST(request) {
  const { allowed } = await rateLimitAsync(`login:${clientIpFromRequest(request)}`, { limit: 10, windowMs: 60_000 });
  if (!allowed) return fail("Too many login attempts. Please try again in a minute.", 429);

  const { email, password } = (await request.json()) || {};
  if (!email || !password) return fail("Email and password are required");

  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) return fail("Invalid email or password", 401);

  if (user.status !== "active") return fail("This account has been suspended", 403);

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return fail("Invalid email or password", 401);

  user.lastLoginAt = new Date();
  await user.save();

  const token = issueSessionToken(user);
  const res = ok({
    user: { id: user._id, name: user.name, email: user.email, role: user.role, vendor: user.vendor || null },
  });
  res.cookies.set(buildAuthCookie(token));
  return res;
}
