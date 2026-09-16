import { connectDB } from "@/lib/db/connect";
import Blog from "@/models/Blog";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

export async function PUT(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const set = { ...body };
    if (body.status === "published") set.publishedAt = new Date();

    const post = await Blog.findByIdAndUpdate(id, { $set: set }, { new: true, runValidators: true });
    if (!post) throw new ApiError(404, "Post not found");
    return ok({ post });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    await connectDB();
    const result = await Blog.deleteOne({ _id: id });
    if (!result.deletedCount) throw new ApiError(404, "Post not found");
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
