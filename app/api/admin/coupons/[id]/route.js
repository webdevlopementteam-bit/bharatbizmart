import { connectDB } from "@/lib/db/connect";
import Coupon from "@/models/Coupon";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

export async function PUT(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const coupon = await Coupon.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!coupon) throw new ApiError(404, "Coupon not found");
    return ok({ coupon });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    await connectDB();
    const result = await Coupon.deleteOne({ _id: id });
    if (!result.deletedCount) throw new ApiError(404, "Coupon not found");
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
