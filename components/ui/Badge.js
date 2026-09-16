import clsx from "clsx";
import { BadgeCheck, ShieldCheck, Star, Crown } from "lucide-react";

const styles = {
  verified: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  trusted: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  premium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
};

const icons = {
  verified_supplier: BadgeCheck,
  gst_verified: ShieldCheck,
  business_verified: BadgeCheck,
  trusted_seller: Star,
  premium_supplier: Crown,
};

const labels = {
  verified_supplier: "Verified Supplier",
  gst_verified: "GST Verified",
  business_verified: "Business Verified",
  trusted_seller: "Trusted Seller",
  premium_supplier: "Premium Supplier",
};

export function VerificationBadge({ badge, className }) {
  const Icon = icons[badge] || BadgeCheck;
  const style = badge === "premium_supplier" ? "premium" : badge === "trusted_seller" ? "trusted" : "verified";
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", styles[style], className)}>
      <Icon className="h-3.5 w-3.5" />
      {labels[badge] || badge}
    </span>
  );
}

export default function Badge({ children, tone = "neutral", className }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", styles[tone], className)}>
      {children}
    </span>
  );
}
