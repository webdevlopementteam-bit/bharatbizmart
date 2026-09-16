"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/marketplace/ProductCard";
import SupplierCard from "@/components/marketplace/SupplierCard";
import EmptyState from "@/components/ui/EmptyState";
import { Heart } from "lucide-react";

export default function SavedItemsPage() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/save/products").then((r) => r.json()),
      fetch("/api/save/vendors").then((r) => r.json()),
    ]).then(([p, v]) => {
      setProducts(p.savedProducts || []);
      setVendors(v.savedVendors || []);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Saved Items</h1>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setTab("products")} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "products" ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
          Products ({products.length})
        </button>
        <button onClick={() => setTab("suppliers")} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === "suppliers" ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
          Suppliers ({vendors.length})
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : tab === "products" ? (
        products.length === 0 ? (
          <EmptyState icon={Heart} title="No saved products" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )
      ) : vendors.length === 0 ? (
        <EmptyState icon={Heart} title="No saved suppliers" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {vendors.map((v) => <SupplierCard key={v._id} vendor={v} />)}
        </div>
      )}
    </div>
  );
}
