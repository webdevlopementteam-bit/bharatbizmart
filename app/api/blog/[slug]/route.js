import { connectDB } from "@/lib/db/connect";
import Blog from "@/models/Blog";
import { ok, fail } from "@/lib/utils/api";

export async function GET(request, { params }) {
  const { slug } = await params;
  await connectDB();

  const post = await Blog.findOne({ slug, status: "published" }).populate("author", "name").populate("category", "name slug").lean();
  if (!post) return fail("Article not found", 404);

  Blog.updateOne({ _id: post._id }, { $inc: { viewCount: 1 } }).catch(() => {});

  const related = await Blog.find({ category: post.category?._id, status: "published", _id: { $ne: post._id } })
    .limit(4)
    .select("title slug featuredImage publishedAt")
    .lean();

  return ok({ post, related });
}
