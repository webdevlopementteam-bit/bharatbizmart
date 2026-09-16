import Link from "next/link";
import * as Icons from "lucide-react";

export default function CategoryCard({ category }) {
  const Icon = Icons[category.icon] || Icons.Boxes;
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="card-premium group flex flex-col items-center gap-3 rounded-2xl p-5 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/10 to-brand-light/10 text-brand transition-colors group-hover:from-brand-light group-hover:to-brand group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-sm font-medium text-slate-800">{category.name}</span>
      {typeof category.vendorCount === "number" && (
        <span className="text-xs text-slate-400">{category.vendorCount}+ suppliers</span>
      )}
    </Link>
  );
}
