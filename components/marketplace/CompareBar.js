"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Scale } from "lucide-react";
import { useCompare } from "@/components/CompareProvider";

export default function CompareBar() {
  const { items, removeItem, clear } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur shadow-[0_-8px_24px_-8px_rgba(15,23,42,0.15)]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate-700">
          <Scale className="h-4 w-4 text-brand" /> Compare ({items.length})
        </div>
        <div className="flex flex-1 gap-2 overflow-x-auto scrollbar-none">
          {items.map((p) => (
            <div key={p._id} className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} fill className="object-cover" /> : <span className="text-[9px] text-slate-400">No img</span>}
              <button onClick={() => removeItem(p._id)} className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center bg-black/60 text-white">
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={clear} className="shrink-0 text-xs font-medium text-slate-400 hover:text-red-600">Clear</button>
        <Link href="/compare" className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          Compare Now
        </Link>
      </div>
    </div>
  );
}
