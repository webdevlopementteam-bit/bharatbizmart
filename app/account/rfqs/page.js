"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { FileText, Plus } from "lucide-react";

export default function AccountRfqsPage() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rfq?mine=true")
      .then((r) => r.json())
      .then((d) => setRfqs(d.rfqs || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">My Requirements</h1>
        <Button href="/post-requirement" size="sm"><Plus className="h-4 w-4" /> Post Requirement</Button>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : rfqs.length === 0 ? (
        <EmptyState icon={FileText} title="No requirements posted" description="Post a buying requirement to get quotations from suppliers." />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {rfqs.map((r) => (
            <Link key={r._id} href={`/rfq/${r._id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-500">{r.quotations?.length || 0} quotations received</p>
              </div>
              <Badge tone={r.status === "open" ? "trusted" : "neutral"}>{r.status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
