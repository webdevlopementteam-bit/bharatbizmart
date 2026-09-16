import { connectDB } from "@/lib/db/connect";
import Banner from "@/models/Banner";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

export async function PUT(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const banner = await Banner.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!banner) throw new ApiError(404, "Banner not found");
    return ok({ banner });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    await connectDB();
    const result = await Banner.deleteOne({ _id: id });
    if (!result.deletedCount) throw new ApiError(404, "Banner not found");
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
