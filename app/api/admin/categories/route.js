import { connectDB } from "@/lib/db/connect";
import Category from "@/models/Category";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { ok, fail } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireUser(["admin", "superadmin"]);
    await connectDB();
    const categories = await Category.find().populate("parent", "name").sort({ order: 1, name: 1 }).lean();
    return ok({ categories });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    await requireUser(["admin", "superadmin"]);
    const body = await request.json();
    if (!body?.name) return fail("Category name is required");

    await connectDB();
    const slug = await generateUniqueSlug(Category, body.name);
    const category = await Category.create({ ...body, slug, parent: body.parent || null });
    return ok({ category }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
