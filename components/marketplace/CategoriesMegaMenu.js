"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Icons from "lucide-react";
import { ChevronDown } from "lucide-react";

export default function CategoriesMegaMenu() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState(null);
  const [subMap, setSubMap] = useState({});

  useEffect(() => {
    if (!open || categories.length) return;
    fetch("/api/categories?parent=root")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories || []);
        setActive(d.categories?.[0]?._id || null);
      });
  }, [open, categories.length]);

  useEffect(() => {
    if (!active || subMap[active]) return;
    fetch(`/api/categories/${categories.find((c) => c._id === active)?.slug}`)
      .then((r) => r.json())
      .then((d) => setSubMap((m) => ({ ...m, [active]: d.subCategories || [] })));
  }, [active, categories, subMap]);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
        Categories
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 flex w-[640px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="w-56 border-r border-slate-100 bg-slate-50/60 py-2">
            {categories.map((c) => {
              const Icon = Icons[c.icon] || Icons.Boxes;
              return (
                <button
                  key={c._id}
                  onMouseEnter={() => setActive(c._id)}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm ${
                    active === c._id ? "bg-white font-semibold text-brand" : "text-slate-600 hover:bg-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="line-clamp-1">{c.name}</span>
                </button>
              );
            })}
          </div>
          <div className="flex-1 p-5">
            {active && (
              <>
                <Link
                  href={`/categories/${categories.find((c) => c._id === active)?.slug}`}
                  className="text-sm font-semibold text-slate-900 hover:text-brand"
                >
                  {categories.find((c) => c._id === active)?.name} — view all
                </Link>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                  {(subMap[active] || []).map((s) => (
                    <Link key={s._id} href={`/categories/${s.slug}`} className="text-sm text-slate-500 hover:text-brand">
                      {s.name}
                    </Link>
                  ))}
                  {subMap[active]?.length === 0 && <p className="text-sm text-slate-400">No subcategories yet.</p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
