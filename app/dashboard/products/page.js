"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";

export default function VendorProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/vendor/products").then((r) => r.json()).then((d) => setProducts(d.products || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/vendor/products/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Product deleted");
      setProducts((p) => p.filter((x) => x._id !== id));
    } else toast.error(data.message);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Products</h1>
        <Button href="/dashboard/products/new" size="sm"><Plus className="h-4 w-4" /> Add Product</Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" description="Add your first product to start receiving enquiries." action={<Button href="/dashboard/products/new" size="sm">Add Product</Button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="flex items-center gap-3 px-4 py-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                    </div>
                    <span className="line-clamp-1 font-medium text-slate-800">{p.name}</span>
                  </td>
                  <td className="px-4 py-3">{p.price?.min ? `₹${p.price.min}` : "-"}</td>
                  <td className="px-4 py-3">{p.viewCount}</td>
                  <td className="px-4 py-3"><Badge tone={p.status === "active" ? "verified" : "neutral"}>{p.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/products/${p._id}`} className="text-slate-400 hover:text-brand"><Pencil className="h-4 w-4" /></Link>
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
