import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, ShieldCheck, ArrowRight, ArrowUpRight, BadgeCheck } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcons";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "BharatBizMart";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function VendorSiteFooter({ vendor }) {
  const isServiceVendor = vendor.businessType === "service_provider";
  const socialLinks = ["facebook", "instagram", "linkedin", "twitter", "youtube"].filter((k) => vendor.social?.[k]);

  const quickLinks = [
    { href: "/about", label: "About Us" },
    isServiceVendor ? { href: "/services", label: "Our Services" } : { href: "/products", label: "Our Products" },
    { href: "/gallery", label: "Gallery" },
    { href: "/certifications", label: "Certifications" },
    { href: "/reviews", label: "Reviews" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <footer className="mt-16 border-t-2 bg-white" style={{ borderColor: "var(--site-primary)" }}>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            {vendor.logo ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200">
                <Image src={vendor.logo} alt={vendor.businessName} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ background: "var(--site-primary)" }}>
                {vendor.businessName?.[0]}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900">{vendor.businessName}</h3>
              {vendor.city && <p className="text-xs text-slate-400">{vendor.city}, {vendor.state}</p>}
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-500">{vendor.tagline || vendor.description?.slice(0, 140)}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {vendor.verification?.status === "verified" && (
              <p
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                style={{ borderColor: "var(--site-primary)", color: "var(--site-primary)" }}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Business
              </p>
            )}
            {vendor.gstNumber && (
              <p className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
                <BadgeCheck className="h-3.5 w-3.5" /> GST {vendor.gstNumber}
              </p>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="mt-5 flex gap-2">
              {socialLinks.map((k) => (
                <a
                  key={k}
                  href={vendor.social[k]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={k}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:border-transparent hover:text-white"
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--site-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <SocialIcon name={k} className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Quick Links</h4>
          <span className="mt-2 block h-0.5 w-8 rounded-full" style={{ background: "var(--site-primary)" }} />
          <ul className="mt-4 space-y-2.5">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900">
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    style={{ color: "var(--site-primary)" }}
                  />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Contact</h4>
          <span className="mt-2 block h-0.5 w-8 rounded-full" style={{ background: "var(--site-primary)" }} />
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            {vendor.address && (
              <p className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--site-primary) 10%, white)", color: "var(--site-primary)" }}>
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <span>{vendor.address}, {vendor.city}, {vendor.state}</span>
              </p>
            )}
            {vendor.phone && (
              <a href={`tel:${vendor.phone}`} className="flex items-center gap-2.5 hover:text-slate-900">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--site-primary) 10%, white)", color: "var(--site-primary)" }}>
                  <Phone className="h-3.5 w-3.5" />
                </span>
                {vendor.phone}
              </a>
            )}
            {vendor.email && (
              <a href={`mailto:${vendor.email}`} className="flex items-center gap-2.5 hover:text-slate-900">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--site-primary) 10%, white)", color: "var(--site-primary)" }}>
                  <Mail className="h-3.5 w-3.5" />
                </span>
                {vendor.email}
              </a>
            )}
            {vendor.whatsapp && (
              <a href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 hover:text-slate-900">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#25D366]">
                  <SocialIcon name="whatsapp" className="h-3.5 w-3.5" />
                </span>
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Powered By</h4>
          <span className="mt-2 block h-0.5 w-8 rounded-full" style={{ background: "var(--site-primary)" }} />
          <a
            href={APP_URL}
            target="_blank"
            rel="noreferrer"
            className="group mt-4 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Image src="/logo.jpeg" alt={APP_NAME} width={1128} height={191} className="h-6 w-auto" />
            <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-500" />
          </a>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            This free business website is auto-generated and hosted by <span className="font-medium text-slate-500">{APP_NAME}</span>.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:px-6">
          <p>&copy; {new Date().getFullYear()} {vendor.businessName}. All rights reserved.</p>
          <p>
            Website by{" "}
            <a href={APP_URL} target="_blank" rel="noreferrer" className="font-medium hover:underline" style={{ color: "var(--site-primary)" }}>
              {APP_NAME}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
