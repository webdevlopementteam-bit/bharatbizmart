"use client";

import { Scale, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useCompare } from "@/components/CompareProvider";

export default function CompareToggle({ product }) {
  const { items, toggleItem, max } = useCompare();
  const active = items.some((p) => p._id === product._id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!active && items.length >= max) {
      toast.error(`You can compare up to ${max} products at a time`);
      return;
    }
    toggleItem({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      images: product.images,
      price: product.price,
      moq: product.moq,
      moqUnit: product.moqUnit,
      vendor: product.vendor,
    });
  };

  return (
    <button
      onClick={handleClick}
      title={active ? "Remove from compare" : "Add to compare"}
      className={`absolute left-2 top-2 z-10 flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-semibold shadow-sm backdrop-blur transition-colors ${
        active ? "bg-brand text-white" : "bg-white/90 text-slate-600 hover:bg-white"
      }`}
    >
      {active ? <Check className="h-3 w-3" /> : <Scale className="h-3 w-3" />}
      Compare
    </button>
  );
}
