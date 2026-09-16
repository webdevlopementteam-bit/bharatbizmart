"use client";

import { useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { ReceiptText, FileDown } from "lucide-react";

const tone = { sent: "trusted", accepted: "verified", rejected: "neutral", negotiating: "premium", expired: "neutral" };

export default function VendorQuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quotations").then((r) => r.json()).then((d) => setQuotations(d.quotations || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Quotations Sent</h1>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : quotations.length === 0 ? (
        <EmptyState icon={ReceiptText} title="No quotations sent yet" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.map((q) => (
                <tr key={q._id}>
                  <td className="px-4 py-3">{q.productName || q.product?.name}</td>
                  <td className="px-4 py-3">{q.quantity}</td>
                  <td className="px-4 py-3 font-medium">₹{q.totalAmount?.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3"><Badge tone={tone[q.status]}>{q.status}</Badge></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <a href={`/api/quotations/${q._id}/pdf`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                      <FileDown className="h-3.5 w-3.5" /> Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
