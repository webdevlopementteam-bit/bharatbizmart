import { connectDB } from "@/lib/db/connect";
import RFQ from "@/models/RFQ";
import Link from "next/link";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { FileText, Plus } from "lucide-react";

export const metadata = {
  title: "Buying Requirements",
  description: "Browse recent buying requirements posted by buyers looking for suppliers.",
};

export default async function RfqListPage() {
  await connectDB();
  const rfqs = await RFQ.find({ status: "open" }).populate("category", "name").sort({ createdAt: -1 }).limit(48).lean();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Buying Requirements</h1>
        <Button href="/post-requirement" size="sm"><Plus className="h-4 w-4" /> Post Requirement</Button>
      </div>

      {rfqs.length === 0 ? (
        <EmptyState icon={FileText} title="No open requirements" />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rfqs.map((r) => (
            <Link key={r._id} href={`/rfq/${r._id}`} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md">
              <h3 className="text-sm font-semibold text-slate-900">{r.title}</h3>
              <p className="text-xs text-slate-500">{r.category?.name}</p>
              <div className="flex flex-wrap gap-x-3 text-xs text-slate-500">
                {r.quantity && <span>Qty: {r.quantity}</span>}
                {r.deliveryLocation && <span>{r.deliveryLocation}</span>}
              </div>
              <span className="mt-auto text-xs font-medium text-brand">View details →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
