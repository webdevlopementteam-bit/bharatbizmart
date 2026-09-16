import Link from "next/link";
import Image from "next/image";
import { MapPin, Sparkles } from "lucide-react";
import { VerificationBadge } from "@/components/ui/Badge";
import CompareToggle from "./CompareToggle";

function formatPrice(price) {
  if (!price?.min) return "Price on Request";
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  if (price.max && price.max !== price.min) return `${fmt(price.min)} - ${fmt(price.max)}`;
  return fmt(price.min);
}

export default function ProductCard({ product }) {
  const vendor = product.vendor || {};
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card-premium group flex flex-col overflow-hidden rounded-2xl bg-white"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <CompareToggle product={product} />
        {product.isFeatured && (
          <span className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-accent-dark px-2 py-1 text-[10px] font-bold text-white shadow-sm">
            <Sparkles className="h-3 w-3" /> Featured
          </span>
        )}
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-sm font-medium text-slate-800">{product.name}</h3>
        <p className="font-display text-sm font-bold text-slate-900">{formatPrice(product.price)}</p>
        {product.moq && <p className="text-xs text-slate-500">MOQ: {product.moq} {product.moqUnit}</p>}
        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <span className="line-clamp-1">{vendor.businessName}</span>
        </div>
        {(vendor.city || vendor.state) && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3" />
            {vendor.city}{vendor.city && vendor.state ? ", " : ""}{vendor.state}
          </div>
        )}
        {vendor.verification?.badges?.[0] && <VerificationBadge badge={vendor.verification.badges[0]} />}
        <span className="mt-auto inline-flex items-center justify-center rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition-colors group-hover:bg-brand group-hover:text-white">
          Get Best Price
        </span>
      </div>
    </Link>
  );
}
