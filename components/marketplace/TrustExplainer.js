import { ShieldCheck, Building2, Star, Crown, ArrowRight } from "lucide-react";

const badges = [
  {
    key: "gst_verified",
    icon: ShieldCheck,
    title: "GST Verified",
    desc: "GST registration checked and confirmed by our team.",
    footer: "Verified for your trust",
    color: "green",
  },
  {
    key: "business_verified",
    icon: Building2,
    title: "Business Verified",
    desc: "Business registration and identity documents reviewed.",
    footer: "Trusted businesses only",
    color: "blue",
  },
  {
    key: "trusted_seller",
    icon: Star,
    title: "Trusted Seller",
    desc: "Consistently high ratings and reliable order fulfillment.",
    footer: "Rated by real buyers",
    color: "violet",
  },
  {
    key: "premium_supplier",
    icon: Crown,
    title: "Premium Supplier",
    desc: "Premium-plan sellers with enhanced visibility and support.",
    footer: "Top verified suppliers",
    color: "amber",
  },
];

const palette = {
  green: { iconBg: "bg-green-100", iconText: "text-green-600", ghost: "text-green-200", footerBg: "bg-green-50", footerText: "text-green-700", dot: "bg-green-600", btn: "bg-green-600" },
  blue: { iconBg: "bg-blue-100", iconText: "text-blue-600", ghost: "text-blue-200", footerBg: "bg-blue-50", footerText: "text-blue-700", dot: "bg-blue-600", btn: "bg-blue-600" },
  violet: { iconBg: "bg-violet-100", iconText: "text-violet-600", ghost: "text-violet-200", footerBg: "bg-violet-50", footerText: "text-violet-700", dot: "bg-violet-600", btn: "bg-violet-600" },
  amber: { iconBg: "bg-amber-100", iconText: "text-amber-600", ghost: "text-amber-200", footerBg: "bg-amber-50", footerText: "text-amber-700", dot: "bg-amber-600", btn: "bg-amber-600" },
};

export default function TrustExplainer() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {badges.map((b, i) => {
        const c = palette[b.color];
        return (
          <div key={b.key} className="card-premium flex flex-col overflow-hidden rounded-2xl p-0">
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${c.iconBg} ${c.iconText}`}>
                  <b.icon className="h-6 w-6" />
                </div>
                <span className={`font-display text-2xl font-bold ${c.ghost}`}>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{b.desc}</p>
            </div>

            <div className={`flex items-center justify-between ${c.footerBg} px-6 py-3.5`}>
              <span className={`flex items-center gap-2 text-xs font-medium ${c.footerText}`}>
                <span className={`h-0.5 w-4 rounded-full ${c.dot}`} />
                {b.footer}
              </span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${c.btn}`}>
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
