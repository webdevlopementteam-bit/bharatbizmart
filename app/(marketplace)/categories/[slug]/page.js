import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import CategoryCard from "@/components/marketplace/CategoryCard";
import ProductCard from "@/components/marketplace/ProductCard";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const category = await Category.findOne({ slug }).lean();
  if (!category) return {};
  return {
    title: category.seo?.title || category.name,
    description: category.seo?.description || category.description || `Browse ${category.name} suppliers and products.`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryDetailPage({ params }) {
  const { slug } = await params;
  await connectDB();

  const category = await Category.findOne({ slug, status: "active" }).lean();
  if (!category) notFound();

  const [subCategories, products] = await Promise.all([
    Category.find({ parent: category._id, status: "active" }).sort({ order: 1, name: 1 }).lean(),
    Product.find({ category: category._id, status: "active" }).populate("vendor", "businessName slug city verification").limit(24).lean(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Categories", item: "/categories" },
      { "@type": "ListItem", position: 3, name: category.name, item: `/categories/${category.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-2xl font-bold text-slate-900">{category.name}</h1>
      {category.description && <p className="mt-2 max-w-2xl text-sm text-slate-500">{category.description}</p>}

      {subCategories.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {subCategories.map((c) => <CategoryCard key={c._id} category={JSON.parse(JSON.stringify(c))} />)}
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Products in {category.name}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((p) => <ProductCard key={p._id} product={JSON.parse(JSON.stringify(p))} />)}
      </div>
      {products.length === 0 && <p className="text-sm text-slate-400">No products in this category yet.</p>}
    </div>
  );
}
