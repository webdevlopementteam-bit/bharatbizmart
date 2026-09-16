"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { SocialIcon } from "@/components/ui/SocialIcons";

const baseNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products", productsOnly: true },
  { href: "/services", label: "Services", servicesOnly: true },
  { href: "/gallery", label: "Gallery" },
  { href: "/certifications", label: "Certifications" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export default function VendorSiteHeader({ vendor, website }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isServiceVendor = vendor.businessType === "service_provider";

  // A service business has no product catalog to show, and vice versa — so
  // neither the nav link nor the underlying page should exist for the type
  // that doesn't apply (see products/page.js and services/page.js guards).
  const nav = baseNav.filter((item) => {
    if (item.productsOnly) return !isServiceVendor;
    if (item.servicesOnly) return isServiceVendor;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          {vendor.logo ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200">
              <Image src={vendor.logo} alt={vendor.businessName} fill className="object-cover" />
            </div>
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
              style={{ background: "var(--site-primary)" }}
            >
              {vendor.businessName?.[0]}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-base font-bold text-slate-900">{vendor.businessName}</span>
              {vendor.verification?.status === "verified" && (
                <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: "var(--site-primary)" }} />
              )}
            </div>
            {vendor.city && <p className="truncate text-[11px] text-slate-400">{vendor.city}, {vendor.state}</p>}
          </div>
        </Link>

        <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-white" : "text-slate-600 hover:bg-slate-100"
                )}
                style={active ? { background: "var(--site-primary)" } : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          {vendor.whatsapp && (
            <a
              href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-[#25D366] hover:bg-[#25D366]/10 sm:flex"
              aria-label="WhatsApp"
            >
              <SocialIcon name="whatsapp" className="h-4 w-4" />
            </a>
          )}
          {vendor.phone && (
            <a
              href={`tel:${vendor.phone}`}
              className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white lg:flex"
              style={{ background: "var(--site-primary)" }}
            >
              <Phone className="h-4 w-4" /> {vendor.phone}
            </a>
          )}

          <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-4 py-3 lg:hidden">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              {item.label}
            </Link>
          ))}
          {vendor.phone && (
            <a href={`tel:${vendor.phone}`} className="mt-2 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ background: "var(--site-primary)" }}>
              <Phone className="h-4 w-4" /> Call {vendor.phone}
            </a>
          )}
        </div>
      )}
    </header>
  );
}
