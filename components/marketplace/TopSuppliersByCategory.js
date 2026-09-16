"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import SupplierCard from "./SupplierCard";
import { CardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Building2 } from "lucide-react";

export default function TopSuppliersByCategory({ categories }) {
  const [activeId, setActiveId] = useState(categories[0]?._id);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/vendors?category=${activeId}&sort=rating&limit=4`)
      .then((r) => r.json())
      .then((d) => setVendors(d.vendors || []))
      .finally(() => setLoading(false));
  }, [activeId]);

  if (!categories.length) return null;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => setActiveId(c._id)}
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeId === c._id ? "bg-brand text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-brand hover:text-brand"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : vendors.map((v) => <SupplierCard key={v._id} vendor={v} />)}
      </div>

      {!loading && vendors.length === 0 && (
        <EmptyState icon={Building2} title="No suppliers in this category yet" />
      )}
    </div>
  );
}
