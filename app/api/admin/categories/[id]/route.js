import { connectDB } from "@/lib/db/connect";
import Category from "@/models/Category";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, stripEmptyRefs } from "@/lib/utils/api";

export async function PUT(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    const body = stripEmptyRefs(await request.json(), ["parent"]);

    await connectDB();
    const category = await Category.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true });
    if (!category) throw new ApiError(404, "Category not found");
    return ok({ category });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;

    await connectDB();
    const hasChildren = await Category.exists({ parent: id });
    if (hasChildren) throw new ApiError(409, "Delete or reassign subcategories first");

    const result = await Category.deleteOne({ _id: id });
    if (!result.deletedCount) throw new ApiError(404, "Category not found");
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
