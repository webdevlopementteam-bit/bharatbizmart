import { connectDB } from "@/lib/db/connect";
import Category from "@/models/Category";
import { ok, fail } from "@/lib/utils/api";

export async function GET(request, { params }) {
  const { slug } = await params;
  await connectDB();

  const category = await Category.findOne({ slug, status: "active" }).lean();
  if (!category) return fail("Category not found", 404);

  const subCategories = await Category.find({ parent: category._id, status: "active" }).sort({ order: 1, name: 1 }).lean();

  return ok({ category, subCategories });
}
