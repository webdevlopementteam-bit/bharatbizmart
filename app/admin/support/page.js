"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { LifeBuoy } from "lucide-react";

const tone = { open: "trusted", in_progress: "premium", resolved: "verified", closed: "neutral" };

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qs = filter ? `?status=${filter}` : "";
    fetch(`/api/admin/support${qs}`).then((r) => r.json()).then((d) => setTickets(d.tickets || [])).finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Support Tickets</h1>
      <div className="mb-4 flex gap-2">
        {["", "open", "in_progress", "resolved", "closed"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filter === s ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No support tickets" />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {tickets.map((t) => (
            <Link key={t._id} href={`/admin/support/${t._id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-900">{t.subject}</p>
                <p className="text-xs text-slate-500">{t.user?.name} ({t.user?.role}) · {new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
              <Badge tone={tone[t.status]}>{t.status.replace("_", " ")}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
