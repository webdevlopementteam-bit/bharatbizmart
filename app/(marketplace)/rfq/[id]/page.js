import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import RFQ from "@/models/RFQ";
import Rating from "@/components/ui/Rating";
import { VerificationBadge } from "@/components/ui/Badge";
import Link from "next/link";

export const metadata = { title: "Buying Requirement" };

export default async function RfqDetailPage({ params }) {
  const { id } = await params;
  await connectDB();

  let rfq;
  try {
    rfq = await RFQ.findById(id)
      .populate("buyer", "name")
      .populate("category", "name")
      .populate({ path: "quotations", populate: { path: "vendor", select: "businessName slug logo verification ratingAverage" } })
      .lean();
  } catch {
    rfq = null;
  }
  if (!rfq) notFound();

  const data = JSON.parse(JSON.stringify(rfq));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">{data.title}</h1>
      <p className="mt-1 text-sm text-slate-500">Posted by {data.buyer?.name} · {data.category?.name}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-4">
        {data.quantity && <Info label="Quantity" value={data.quantity} />}
        {data.budget && <Info label="Budget" value={data.budget} />}
        {data.deliveryLocation && <Info label="Delivery Location" value={data.deliveryLocation} />}
        {data.requiredByDate && <Info label="Required By" value={new Date(data.requiredByDate).toLocaleDateString()} />}
      </div>

      {data.description && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-900">Description</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{data.description}</p>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Quotations ({data.quotations?.length || 0})</h2>
        <div className="mt-4 space-y-3">
          {data.quotations?.map((q) => (
            <div key={q._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <Link href={`/suppliers/${q.vendor?.slug}`} className="text-sm font-semibold text-slate-900 hover:text-brand">{q.vendor?.businessName}</Link>
                <Rating value={q.vendor?.ratingAverage} showCount={false} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {q.vendor?.verification?.badges?.map((b) => <VerificationBadge key={b} badge={b} />)}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <Info label="Unit Price" value={`₹${q.unitPrice}`} />
                <Info label="Total" value={`₹${q.totalAmount?.toLocaleString("en-IN")}`} />
                <Info label="Delivery" value={q.deliveryTime || "-"} />
                <Info label="Status" value={q.status} />
              </div>
            </div>
          ))}
          {(!data.quotations || data.quotations.length === 0) && <p className="text-sm text-slate-400">No quotations received yet.</p>}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}
