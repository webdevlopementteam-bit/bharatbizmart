"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import { Trash2, Star } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/products").then((r) => r.json()).then((d) => setProducts(d.products || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setStatus = async (id, status) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) { toast.success("Updated"); load(); }
  };

  const toggleFeatured = async (id, isFeatured) => {
    await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) load();
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Products</h1>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-500">{p.vendor?.businessName}</td>
                  <td className="px-4 py-3"><Badge tone={p.status === "active" ? "verified" : "neutral"}>{p.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <select value={p.status} onChange={(e) => setStatus(p._id, e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">
                        <option value="active">Active</option>
                        <option value="pending_approval">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="archived">Archived</option>
                      </select>
                      <button onClick={() => toggleFeatured(p._id, p.isFeatured)} className={p.isFeatured ? "text-amber-500" : "text-slate-300 hover:text-amber-500"}>
                        <Star className="h-4 w-4" fill={p.isFeatured ? "currentColor" : "none"} />
                      </button>
                      <button onClick={() => remove(p._id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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
