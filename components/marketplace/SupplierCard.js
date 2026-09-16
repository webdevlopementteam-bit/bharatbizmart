import Link from "next/link";
import Image from "next/image";
import { MapPin, Building2 } from "lucide-react";
import Rating from "@/components/ui/Rating";
import { VerificationBadge } from "@/components/ui/Badge";

const typeLabels = {
  manufacturer: "Manufacturer",
  supplier: "Supplier",
  distributor: "Distributor",
  wholesaler: "Wholesaler",
  retailer: "Retailer",
  dealer: "Dealer",
  exporter: "Exporter",
  service_provider: "Service Provider",
};

export default function SupplierCard({ vendor }) {
  return (
    <Link
      href={`/suppliers/${vendor.slug}`}
      className="card-premium flex flex-col gap-3 rounded-2xl p-4"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-100">
          {vendor.logo ? (
            <Image src={vendor.logo} alt={vendor.businessName} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 className="h-6 w-6 text-slate-300" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900">{vendor.businessName}</h3>
          <p className="text-xs text-slate-500">{typeLabels[vendor.businessType] || vendor.businessType}</p>
          <Rating value={vendor.ratingAverage} count={vendor.ratingCount} />
        </div>
      </div>
      {(vendor.city || vendor.state) && (
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {vendor.city}{vendor.city && vendor.state ? ", " : ""}{vendor.state}
        </div>
      )}
      {vendor.verification?.badges?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {vendor.verification.badges.slice(0, 2).map((b) => (
            <VerificationBadge key={b} badge={b} />
          ))}
        </div>
      )}
      <span className="mt-auto inline-flex items-center justify-center rounded-lg border border-brand/30 px-3 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white">
        Contact Supplier
      </span>
    </Link>
  );
}
