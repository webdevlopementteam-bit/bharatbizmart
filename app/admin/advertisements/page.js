"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Megaphone } from "lucide-react";

const tone = { active: "verified", paused: "premium", expired: "neutral", draft: "neutral" };

export default function AdminAdvertisementsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/advertisements").then((r) => r.json()).then((d) => setAds(d.ads || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setStatus = async (id, status) => {
    const res = await fetch(`/api/admin/advertisements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) { toast.success("Updated"); load(); }
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Advertisements</h1>
      <p className="mb-4 text-sm text-slate-500">Vendor-purchased promotions and admin-placed sponsored slots.</p>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : ads.length === 0 ? (
        <EmptyState icon={Megaphone} title="No advertisements yet" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Ends</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ads.map((ad) => (
                <tr key={ad._id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{ad.title}</td>
                  <td className="px-4 py-3 text-slate-500">{ad.vendor?.businessName || "—"}</td>
                  <td className="px-4 py-3 capitalize text-slate-500">{ad.type.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-500">{ad.endDate ? new Date(ad.endDate).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3"><Badge tone={tone[ad.status]}>{ad.status}</Badge></td>
                  <td className="px-4 py-3">
                    {ad.status === "active" ? (
                      <button onClick={() => setStatus(ad._id, "paused")} className="text-xs font-medium text-amber-600 hover:underline">Pause</button>
                    ) : (
                      <button onClick={() => setStatus(ad._id, "active")} className="text-xs font-medium text-emerald-600 hover:underline">Activate</button>
                    )}
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
