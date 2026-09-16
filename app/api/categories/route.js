import { connectDB } from "@/lib/db/connect";
import Category from "@/models/Category";
import { requireUser } from "@/lib/auth/guard";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { ok, fail } from "@/lib/utils/api";
import { handleApiError } from "@/lib/auth/guard";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  await connectDB();

  const query = { status: "active" };
  if (searchParams.get("parent") === "root") query.parent = null;
  else if (searchParams.get("parent")) query.parent = searchParams.get("parent");
  if (searchParams.get("featured") === "true") query.isFeatured = true;

  const categories = await Category.find(query).sort({ order: 1, name: 1 }).lean();
  return ok({ categories });
}

// Admin-only category creation.
export async function POST(request) {
  try {
    await requireUser(["admin", "superadmin"]);
    const body = await request.json();
    if (!body?.name) return fail("Category name is required");

    await connectDB();
    const slug = await generateUniqueSlug(Category, body.name);
    const category = await Category.create({ ...body, slug });
    return ok({ category }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
