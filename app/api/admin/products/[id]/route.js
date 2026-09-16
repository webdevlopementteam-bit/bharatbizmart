import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

const ALLOWED_STATUS = ["active", "pending_approval", "rejected", "archived"];

export async function PUT(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    const { status, isFeatured } = await request.json();
    if (status && !ALLOWED_STATUS.includes(status)) return fail("Invalid status");

    await connectDB();
    const set = {};
    if (status) set.status = status;
    if (isFeatured !== undefined) set.isFeatured = isFeatured;

    const product = await Product.findByIdAndUpdate(id, { $set: set }, { new: true });
    if (!product) throw new ApiError(404, "Product not found");
    return ok({ product });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    await connectDB();
    const result = await Product.deleteOne({ _id: id });
    if (!result.deletedCount) throw new ApiError(404, "Product not found");
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
