"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import QuotationModal from "@/components/dashboard/QuotationModal";
import { FileText } from "lucide-react";

export default function VendorRfqsPage() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    fetch("/api/rfq?status=open").then((r) => r.json()).then((d) => setRfqs(d.rfqs || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Buying Requirements (RFQs)</h1>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : rfqs.length === 0 ? (
        <EmptyState icon={FileText} title="No open requirements right now" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rfqs.map((r) => (
            <div key={r._id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">{r.title}</h3>
              <p className="text-xs text-slate-500">{r.category?.name}</p>
              <div className="flex flex-wrap gap-x-3 text-xs text-slate-500">
                {r.quantity && <span>Qty: {r.quantity}</span>}
                {r.deliveryLocation && <span>{r.deliveryLocation}</span>}
              </div>
              <Button size="sm" className="mt-auto" onClick={() => setActive(r)}>Send Quotation</Button>
            </div>
          ))}
        </div>
      )}
      <QuotationModal open={!!active} rfq={active} onClose={() => setActive(null)} />
    </div>
  );
}
