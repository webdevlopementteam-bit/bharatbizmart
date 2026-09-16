"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Inbox, Lock } from "lucide-react";

const statuses = ["new", "contacted", "qualified", "quotation_sent", "negotiation", "won", "lost"];
const tone = { new: "trusted", contacted: "neutral", qualified: "trusted", quotation_sent: "premium", negotiation: "premium", won: "verified", lost: "neutral" };

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/vendor/enquiries").then((r) => r.json()).then((d) => {
      setEnquiries(d.enquiries || []);
      setUsage(d.usage || null);
    }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/vendor/enquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Updated");
      load();
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Enquiries</h1>

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

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : enquiries.length === 0 ? (
        <EmptyState icon={Inbox} title="No enquiries yet" description="Enquiries from your product pages will show up here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Requirement</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.map((e) => (
                <tr key={e._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{e.name}</p>
                    <p className={`flex items-center gap-1 text-xs ${e.isLocked ? "text-amber-600" : "text-slate-500"}`}>
                      {e.isLocked && <Lock className="h-3 w-3" />}
                      {e.mobile}
                    </p>
                    {e.isLocked && (
                      <Link href="/dashboard/subscription" className="text-[11px] font-medium text-brand hover:underline">
                        Upgrade to unlock
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3">{e.product?.name || "-"}</td>
                  <td className="max-w-xs px-4 py-3"><p className="line-clamp-2 text-slate-600">{e.requirement || e.message}</p></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={e.status}
                      onChange={(ev) => updateStatus(e._id, ev.target.value)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
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
