import { connectDB } from "@/lib/db/connect";
import Blog from "@/models/Blog";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { ok, fail, getPagination, buildMeta } from "@/lib/utils/api";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  await connectDB();

  const { page, limit, skip } = getPagination(searchParams, { defaultLimit: 12 });
  const query = { status: "published" };
  if (searchParams.get("category")) query.category = searchParams.get("category");
  if (searchParams.get("tag")) query.tags = searchParams.get("tag");
  const q = searchParams.get("q");
  if (q) query.$text = { $search: q };

  const [posts, total] = await Promise.all([
    Blog.find(query).populate("author", "name").populate("category", "name slug").sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
    Blog.countDocuments(query),
  ]);

  return ok({ posts, meta: buildMeta({ page, limit, total }) });
}

export async function POST(request) {
  try {
    const user = await requireUser(["admin", "superadmin"]);
    const body = await request.json();
    if (!body?.title || !body?.content) return fail("Title and content are required");

    await connectDB();
    const slug = await generateUniqueSlug(Blog, body.title);
    const post = await Blog.create({
      ...body,
      slug,
      author: user._id,
      publishedAt: body.status === "published" ? new Date() : undefined,
    });
    return ok({ post }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
