"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";

const businessTypes = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "supplier", label: "Supplier" },
  { value: "distributor", label: "Distributor" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "retailer", label: "Retailer" },
  { value: "dealer", label: "Dealer" },
  { value: "exporter", label: "Exporter" },
];

const sortOptions = [
  { value: "", label: "Relevance" },
  { value: "popular", label: "Popularity" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

export default function ProductFilters({ categories }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const current = Object.fromEntries(searchParams.entries());

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const clearAll = () => startTransition(() => router.push(pathname));

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
        <button onClick={clearAll} className="text-xs font-medium text-brand hover:underline">
          Clear all
        </button>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase text-slate-400">Sort by</label>
        <select
          value={current.sort || ""}
          onChange={(e) => setParam("sort", e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase text-slate-400">Category</label>
        <select
          value={current.category || ""}
          onChange={(e) => setParam("category", e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase text-slate-400">City</label>
        <input
          defaultValue={current.city || ""}
          onBlur={(e) => setParam("city", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setParam("city", e.currentTarget.value)}
          placeholder="e.g. Delhi"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase text-slate-400">Business Type</label>
        <div className="mt-2 space-y-2">
          {businessTypes.map((t) => (
            <label key={t.value} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="radio"
                name="businessType"
                checked={current.businessType === t.value}
                onChange={() => setParam("businessType", t.value)}
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase text-slate-400">Price Range (₹)</label>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            defaultValue={current.minPrice || ""}
            onBlur={(e) => setParam("minPrice", e.target.value)}
            placeholder="Min"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <span className="text-slate-400">-</span>
          <input
            type="number"
            defaultValue={current.maxPrice || ""}
            onBlur={(e) => setParam("maxPrice", e.target.value)}
            placeholder="Max"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={current.verified === "true"}
            onChange={(e) => setParam("verified", e.target.checked ? "true" : "")}
          />
          Verified Suppliers Only
        </label>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" /> Filters
      </button>

      <aside className="hidden lg:block">{content}</aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative ml-auto h-full w-80 overflow-y-auto bg-white p-5 shadow-xl">
            <button onClick={() => setOpen(false)} className="mb-4 ml-auto flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
