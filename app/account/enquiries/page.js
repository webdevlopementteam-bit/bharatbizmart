"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { ClipboardList } from "lucide-react";

const statusTone = { new: "trusted", contacted: "neutral", qualified: "trusted", quotation_sent: "premium", negotiation: "premium", won: "verified", lost: "neutral" };

export default function AccountEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/enquiries")
      .then((r) => r.json())
      .then((d) => setEnquiries(d.enquiries || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">My Enquiries</h1>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : enquiries.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No enquiries yet" description="Enquiries you send to suppliers will appear here." />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {enquiries.map((e) => (
            <div key={e._id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <Link href={`/suppliers/${e.vendor?.slug}`} className="text-sm font-semibold text-slate-900 hover:text-brand">
                  {e.vendor?.businessName}
                </Link>
                <p className="text-xs text-slate-500">{e.product?.name || e.requirement}</p>
                <p className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleDateString()}</p>
              </div>
              <Badge tone={statusTone[e.status] || "neutral"}>{e.status.replace("_", " ")}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
