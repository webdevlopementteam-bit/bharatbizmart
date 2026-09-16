import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Vendor from "@/models/Vendor";
import ProductCard from "@/components/marketplace/ProductCard";
import ProductFilters from "@/components/marketplace/ProductFilters";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { PackageSearch } from "lucide-react";

export const metadata = {
  title: "Search Products",
  description: "Search millions of products from verified manufacturers, suppliers and wholesalers.",
};

const LIMIT = 24;

async function getProducts(searchParams) {
  await connectDB();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const query = { status: "active" };

  if (searchParams.q) query.$text = { $search: searchParams.q };
  if (searchParams.category) query.category = searchParams.category;
  if (searchParams.availability) query.availability = searchParams.availability;
  if (searchParams.minPrice) query["price.min"] = { $gte: Number(searchParams.minPrice) };
  if (searchParams.maxPrice) query["price.max"] = { $lte: Number(searchParams.maxPrice) };

  if (searchParams.city || searchParams.businessType || searchParams.verified) {
    const vq = { status: "approved" };
    if (searchParams.city) vq.city = new RegExp(`^${searchParams.city}$`, "i");
    if (searchParams.businessType) vq.businessType = searchParams.businessType;
    if (searchParams.verified === "true") vq["verification.status"] = "verified";
    const vendorIds = await Vendor.find(vq).distinct("_id");
    query.vendor = { $in: vendorIds };
  }

  let sort = { createdAt: -1 };
  if (searchParams.sort === "popular") sort = { viewCount: -1 };
  if (searchParams.sort === "price_low") sort = { "price.min": 1 };
  if (searchParams.sort === "price_high") sort = { "price.min": -1 };
  if (searchParams.sort === "rating") sort = { createdAt: -1 };

  const [products, total, categories] = await Promise.all([
    Product.find(query)
      .populate("vendor", "businessName slug city state verification businessType")
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * LIMIT)
      .limit(LIMIT)
      .lean(),
    Product.countDocuments(query),
    Category.find({ parent: null, status: "active" }).select("name slug").sort({ order: 1 }).lean(),
  ]);

  return { products: JSON.parse(JSON.stringify(products)), total, page, categories: JSON.parse(JSON.stringify(categories)) };
}

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const { products, total, page, categories } = await getProducts(sp);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {sp.q ? `Results for "${sp.q}"` : "All Products"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{total.toLocaleString("en-IN")} products found</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <ProductFilters categories={categories} />

        <div>
          {products.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No products found" description="Try adjusting your filters or search a different keyword." />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
