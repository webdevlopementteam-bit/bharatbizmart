import { connectDB } from "@/lib/db/connect";
import Advertisement from "@/models/Advertisement";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

export async function PUT(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const ad = await Advertisement.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!ad) throw new ApiError(404, "Advertisement not found");
    return ok({ ad });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    await connectDB();
    const result = await Advertisement.deleteOne({ _id: id });
    if (!result.deletedCount) throw new ApiError(404, "Advertisement not found");
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
