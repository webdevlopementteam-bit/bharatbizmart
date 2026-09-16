"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const list = images?.length ? images : [];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {list[active] ? (
          <Image src={list[active]} alt={name} fill className="object-contain" priority />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No image available</div>
        )}
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
          {list.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                active === i ? "border-brand" : "border-transparent"
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
