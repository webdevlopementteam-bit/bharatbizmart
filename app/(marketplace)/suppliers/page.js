import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import SupplierCard from "@/components/marketplace/SupplierCard";
import SupplierFilters from "@/components/marketplace/SupplierFilters";
import Pagination from "@/components/ui/Pagination";
import EmptyState from "@/components/ui/EmptyState";
import { Building2 } from "lucide-react";

export const metadata = {
  title: "Business Directory - Manufacturers, Suppliers & Wholesalers",
  description: "Browse verified manufacturers, suppliers, distributors, wholesalers, dealers and exporters.",
};

const LIMIT = 24;

async function getVendors(sp) {
  await connectDB();
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const query = { status: "approved" };

  if (sp.q) query.$text = { $search: sp.q };
  if (sp.city) query.city = new RegExp(`^${sp.city}$`, "i");
  if (sp.state) query.state = new RegExp(`^${sp.state}$`, "i");
  if (sp.businessType) query.businessType = sp.businessType;
  if (sp.verified === "true") query["verification.status"] = "verified";

  let sort = { ratingAverage: -1, createdAt: -1 };
  if (sp.sort === "newest") sort = { createdAt: -1 };

  const [vendors, total] = await Promise.all([
    Vendor.find(query)
      .select("businessName slug logo coverImage city state businessType ratingAverage ratingCount verification")
      .sort(sort)
      .skip((page - 1) * LIMIT)
      .limit(LIMIT)
      .lean(),
    Vendor.countDocuments(query),
  ]);

  return { vendors: JSON.parse(JSON.stringify(vendors)), total, page };
}

export default async function SuppliersPage({ searchParams }) {
  const sp = await searchParams;
  const { vendors, total, page } = await getVendors(sp);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Business Directory</h1>
      <p className="mt-1 text-sm text-slate-500">{total.toLocaleString("en-IN")} verified businesses</p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <SupplierFilters />
        <div>
          {vendors.length === 0 ? (
            <EmptyState icon={Building2} title="No suppliers found" description="Try a different search or location." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {vendors.map((v) => <SupplierCard key={v._id} vendor={v} />)}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
