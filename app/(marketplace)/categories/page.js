import { connectDB } from "@/lib/db/connect";
import Category from "@/models/Category";
import CategoryCard from "@/components/marketplace/CategoryCard";

export const metadata = {
  title: "Browse Categories",
  description: "Explore all product and service categories on the marketplace.",
};

export const revalidate = 300;

export default async function CategoriesPage() {
  await connectDB();
  const categories = await Category.find({ parent: null, status: "active" }).sort({ order: 1, name: 1 }).lean();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">All Categories</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((c) => (
          <CategoryCard key={c._id} category={JSON.parse(JSON.stringify(c))} />
        ))}
      </div>
      {categories.length === 0 && <p className="text-sm text-slate-400">No categories added yet.</p>}
    </div>
  );
}
