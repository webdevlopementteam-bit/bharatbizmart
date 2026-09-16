"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { FileText, FileDown } from "lucide-react";

const statusTone = { sent: "trusted", accepted: "verified", rejected: "neutral", negotiating: "premium", expired: "neutral" };

export default function AccountQuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/quotations")
      .then((r) => r.json())
      .then((d) => setQuotations(d.quotations || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const respond = async (id, status) => {
    const res = await fetch(`/api/quotations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Quotation ${status}`);
      load();
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Quotations</h1>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : quotations.length === 0 ? (
        <EmptyState icon={FileText} title="No quotations yet" description="Quotations sent by suppliers will appear here." />
      ) : (
        <div className="space-y-3">
          {quotations.map((q) => (
            <div key={q._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{q.vendor?.businessName}</p>
                  <p className="text-xs text-slate-500">{q.productName || q.product?.name}</p>
                </div>
                <Badge tone={statusTone[q.status] || "neutral"}>{q.status}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div><p className="text-xs text-slate-400">Qty</p><p>{q.quantity}</p></div>
                <div><p className="text-xs text-slate-400">Unit Price</p><p>₹{q.unitPrice}</p></div>
                <div><p className="text-xs text-slate-400">Total</p><p className="font-semibold">₹{q.totalAmount?.toLocaleString("en-IN")}</p></div>
                <div><p className="text-xs text-slate-400">Delivery</p><p>{q.deliveryTime || "-"}</p></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {q.status === "sent" && (
                  <>
                    <Button size="sm" onClick={() => respond(q._id, "accepted")}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => respond(q._id, "negotiating")}>Negotiate</Button>
                    <Button size="sm" variant="ghost" onClick={() => respond(q._id, "rejected")}>Reject</Button>
                  </>
                )}
                <Button as="a" href={`/api/quotations/${q._id}/pdf`} target="_blank" size="sm" variant="outline">
                  <FileDown className="h-4 w-4" /> Download PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
