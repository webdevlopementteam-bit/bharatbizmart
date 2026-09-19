"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Building2, ExternalLink, Trash2 } from "lucide-react";
import { getVendorSiteUrl } from "@/lib/utils/vendorUrl";
import { useAuth } from "@/components/AuthProvider";

const tone = { pending_approval: "premium", approved: "verified", suspended: "neutral", rejected: "neutral" };

export default function AdminVendorsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "superadmin";
  const [vendors, setVendors] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    const qs = filter ? `?status=${filter}` : "";
    fetch(`/api/admin/vendors${qs}`).then((r) => r.json()).then((d) => setVendors(d.vendors || [])).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const act = async (id, action) => {
    let rejectionReason;
    if (action === "reject") rejectionReason = prompt("Reason for rejection (optional):") || "";
    const res = await fetch(`/api/admin/vendors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, rejectionReason }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(`Vendor ${action}d`);
      load();
    } else toast.error(data.message);
  };

  const remove = async (v) => {
    if (!confirm(`Permanently delete "${v.businessName}"? This removes their storefront, products, services and website — it cannot be undone.`)) return;
    const res = await fetch(`/api/admin/vendors/${v._id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Vendor deleted");
      load();
    } else toast.error(data.message);
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Vendors</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {["", "pending_approval", "approved", "suspended", "rejected"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filter === s ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : vendors.length === 0 ? (
        <EmptyState icon={Building2} title="No vendors found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((v) => (
                <tr key={v._id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{v.businessName}</td>
                  <td className="px-4 py-3 text-slate-500">{v.owner?.email}</td>
                  <td className="px-4 py-3">
                    <a href={getVendorSiteUrl(v.slug)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-brand hover:underline">
                      {v.slug} <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-500">{v.subscriptionPlan}</td>
                  <td className="px-4 py-3"><Badge tone={tone[v.status]}>{v.status.replace("_", " ")}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {v.status === "pending_approval" && (
                        <>
                          <Button size="sm" onClick={() => act(v._id, "approve")}>Approve</Button>
                          <Button size="sm" variant="ghost" onClick={() => act(v._id, "reject")}>Reject</Button>
                        </>
                      )}
                      {v.status === "approved" && <Button size="sm" variant="outline" onClick={() => act(v._id, "suspend")}>Suspend</Button>}
                      {v.status === "suspended" && <Button size="sm" onClick={() => act(v._id, "activate")}>Activate</Button>}
                      <Link href={`/suppliers/${v.slug}`} className="text-xs font-medium text-slate-500 hover:text-brand">View</Link>
                      {isSuperAdmin && (
                        <button onClick={() => remove(v)} className="text-slate-400 hover:text-red-600" aria-label="Delete vendor">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
