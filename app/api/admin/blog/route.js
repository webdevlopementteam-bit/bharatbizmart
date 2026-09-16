import { connectDB } from "@/lib/db/connect";
import Blog from "@/models/Blog";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireUser(["admin", "superadmin"]);
    await connectDB();
    const posts = await Blog.find().populate("author", "name").sort({ createdAt: -1 }).lean();
    return ok({ posts });
  } catch (err) {
    return handleApiError(err);
  }
}
