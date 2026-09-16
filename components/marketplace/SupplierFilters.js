"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

const businessTypes = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "supplier", label: "Supplier" },
  { value: "distributor", label: "Distributor" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "retailer", label: "Retailer" },
  { value: "dealer", label: "Dealer" },
  { value: "exporter", label: "Exporter" },
  { value: "service_provider", label: "Service Provider" },
];

export default function SupplierFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const current = Object.fromEntries(searchParams.entries());

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
        <button onClick={() => router.push(pathname)} className="text-xs font-medium text-brand hover:underline">Clear all</button>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-slate-400">City</label>
        <input
          defaultValue={current.city || ""}
          onBlur={(e) => setParam("city", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setParam("city", e.currentTarget.value)}
          placeholder="e.g. Mumbai"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase text-slate-400">Business Type</label>
        <div className="mt-2 space-y-2">
          {businessTypes.map((t) => (
            <label key={t.value} className="flex items-center gap-2 text-sm text-slate-600">
              <input type="radio" name="businessType" checked={current.businessType === t.value} onChange={() => setParam("businessType", t.value)} />
              {t.label}
            </label>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={current.verified === "true"} onChange={(e) => setParam("verified", e.target.checked ? "true" : "")} />
        Verified Only
      </label>
    </div>
  );

  return (
    <>
      <button onClick={() => setOpen(true)} className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 lg:hidden">
        <SlidersHorizontal className="h-4 w-4" /> Filters
      </button>
      <aside className="hidden lg:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative ml-auto h-full w-80 overflow-y-auto bg-white p-5 shadow-xl">
            <button onClick={() => setOpen(false)} className="mb-4 ml-auto flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"><X className="h-4 w-4" /></button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
