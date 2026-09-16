import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

export async function PUT(request) {
  try {
    const user = await requireUser();
    const { name, phone, avatar } = await request.json();

    await connectDB();
    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }) } },
      { new: true }
    );
    return ok({ user: { id: updated._id, name: updated.name, email: updated.email, phone: updated.phone } });
  } catch (err) {
    return handleApiError(err);
  }
}
