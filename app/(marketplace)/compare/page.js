"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Scale } from "lucide-react";
import { useCompare } from "@/components/CompareProvider";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function ComparePage() {
  const { items, removeItem, clear } = useCompare();
  const [details, setDetails] = useState({});

  useEffect(() => {
    items.forEach((item) => {
      if (details[item._id]) return;
      fetch(`/api/products/${item.slug}`)
        .then((r) => r.json())
        .then((d) => setDetails((prev) => ({ ...prev, [item._id]: d.product })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={Scale}
          title="No products to compare"
          description="Browse products and tap “Compare” on any product card to add it here."
          action={<Button href="/products" size="sm">Browse Products</Button>}
        />
      </div>
    );
  }

  const specKeys = Array.from(
    new Set(items.flatMap((p) => (details[p._id]?.specifications || []).map((s) => s.key)))
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Compare Products</h1>
        <button onClick={clear} className="text-sm font-medium text-slate-500 hover:text-red-600">Clear all</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <tbody>
            <tr>
              <td className="w-40 border-b border-slate-100 p-4 text-xs font-semibold uppercase text-slate-400">Product</td>
              {items.map((p) => (
                <td key={p._id} className="relative border-b border-slate-100 p-4 text-center">
                  <button onClick={() => removeItem(p._id)} className="absolute right-2 top-2 text-slate-300 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-lg bg-slate-100">
                    {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                  </div>
                  <Link href={`/products/${p.slug}`} className="mt-2 block text-sm font-semibold text-slate-900 hover:text-brand">{p.name}</Link>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-slate-100 p-4 text-xs font-semibold uppercase text-slate-400">Price</td>
              {items.map((p) => (
                <td key={p._id} className="border-b border-slate-100 p-4 text-center font-semibold text-brand">
                  {p.price?.min ? `₹${p.price.min.toLocaleString("en-IN")}` : "On Request"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-slate-100 p-4 text-xs font-semibold uppercase text-slate-400">MOQ</td>
              {items.map((p) => (
                <td key={p._id} className="border-b border-slate-100 p-4 text-center text-slate-600">{p.moq} {p.moqUnit}</td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-slate-100 p-4 text-xs font-semibold uppercase text-slate-400">Supplier</td>
              {items.map((p) => (
                <td key={p._id} className="border-b border-slate-100 p-4 text-center text-slate-600">{p.vendor?.businessName}</td>
              ))}
            </tr>
            {specKeys.map((key) => (
              <tr key={key}>
                <td className="border-b border-slate-100 p-4 text-xs font-semibold uppercase text-slate-400">{key}</td>
                {items.map((p) => {
                  const spec = details[p._id]?.specifications?.find((s) => s.key === key);
                  return (
                    <td key={p._id} className="border-b border-slate-100 p-4 text-center text-slate-600">
                      {spec?.value || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="p-4"></td>
              {items.map((p) => (
                <td key={p._id} className="p-4 text-center">
                  <Button href={`/products/${p.slug}`} size="sm">View & Enquire</Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
