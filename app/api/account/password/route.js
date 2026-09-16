import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { ok, fail } from "@/lib/utils/api";

export async function PUT(request) {
  try {
    const user = await requireUser();
    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return fail("Current password and a new password (min 6 chars) are required");
    }

    await connectDB();
    const withPassword = await User.findById(user._id).select("+passwordHash");
    const valid = await verifyPassword(currentPassword, withPassword.passwordHash);
    if (!valid) return fail("Current password is incorrect", 401);

    withPassword.passwordHash = await hashPassword(newPassword);
    await withPassword.save();

    return ok({ updated: true });
  } catch (err) {
    return handleApiError(err);
  }
}
