"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Users2, Lock } from "lucide-react";

const statuses = ["new", "contacted", "qualified", "quotation_sent", "negotiation", "won", "lost"];
const tone = { new: "trusted", contacted: "neutral", qualified: "trusted", quotation_sent: "premium", negotiation: "premium", won: "verified", lost: "neutral" };

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  const load = () => {
    const qs = filter ? `?status=${filter}` : "";
    fetch(`/api/vendor/leads${qs}`).then((r) => r.json()).then((d) => {
      setLeads(d.leads || []);
      setUsage(d.usage || null);
    }).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/vendor/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Status updated");
      load();
    }
  };

  const addNote = async () => {
    if (!note.trim() || !selected) return;
    const res = await fetch(`/api/vendor/leads/${selected._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Note added");
      setSelected(data.lead);
      setNote("");
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Leads</h1>

      {usage && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{usage.planName} plan:</span>{" "}
            {Math.min(usage.usedThisMonth, usage.limit)} of {usage.limit} leads unlocked this month
            {usage.usedThisMonth > usage.limit && ` (${usage.usedThisMonth - usage.limit} locked)`}.
          </p>
          {usage.usedThisMonth >= usage.limit && (
            <Link href="/dashboard/subscription" className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">
              Upgrade for more leads
            </Link>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setFilter("")} className={`rounded-full px-3 py-1 text-xs font-medium ${!filter ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>All</button>
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filter === s ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : leads.length === 0 ? (
          <EmptyState icon={Users2} title="No leads found" />
        ) : (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {leads.map((l) => (
              <button key={l._id} onClick={() => setSelected(l)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                    {l.isLocked && <Lock className="h-3.5 w-3.5 text-amber-500" />}
                    {l.buyerName}
                  </p>
                  <p className="text-xs text-slate-500">{l.requirement || l.product?.name}</p>
                </div>
                <Badge tone={tone[l.status]}>{l.status.replace("_", " ")}</Badge>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">{selected.buyerName}</h3>
            <p className="text-xs text-slate-500">{selected.phone} · {selected.email}</p>
            {selected.isLocked && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>Monthly lead limit reached. <Link href="/dashboard/subscription" className="font-semibold underline">Upgrade your plan</Link> to see full contact details.</span>
              </div>
            )}
            <p className="mt-2 text-sm text-slate-600">{selected.requirement}</p>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">Status</label>
              <select
                value={selected.status}
                onChange={(e) => updateStatus(selected._id, e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">Notes</label>
              <div className="mt-1 max-h-32 space-y-1 overflow-y-auto">
                {selected.notes?.map((n, i) => (
                  <p key={i} className="rounded bg-slate-50 px-2 py-1 text-xs text-slate-600">{n.text}</p>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm" />
                <button onClick={addNote} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white">Add</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
