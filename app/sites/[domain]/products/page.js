import { notFound } from "next/navigation";
import { getSiteContext } from "@/lib/tenant/getSiteContext";
import Product from "@/models/Product";
import ProductCard from "@/components/marketplace/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { Package } from "lucide-react";

export default async function VendorProductsListPage({ params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  if (!site) notFound();
  // Service-only businesses don't carry a product catalog.
  if (site.vendor.businessType === "service_provider") notFound();

  const products = await Product.find({ vendor: site.vendor._id, status: "active" }).sort({ createdAt: -1 }).lean();
  const data = JSON.parse(JSON.stringify({ vendor: site.vendor, products }));
  const layout = site.website.theme?.productLayout || "grid";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">All Products</h1>
      {data.products.length === 0 ? (
        <EmptyState icon={Package} title="No products listed yet" />
      ) : layout === "list" ? (
        <div className="mt-6 space-y-3">
          {data.products.map((p) => (
            <div key={p._id} className="max-w-md">
              <ProductCard product={{ ...p, vendor: data.vendor }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.products.map((p) => <ProductCard key={p._id} product={{ ...p, vendor: data.vendor }} />)}
        </div>
      )}
    </div>
  );
}
