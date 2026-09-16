"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Zap, Search, MapPin, Package, Users, Building2, ShieldCheck, Truck,
} from "lucide-react";
import clsx from "clsx";

const modes = [
  { key: "products", label: "Products", href: "/products", icon: Package },
  { key: "suppliers", label: "Suppliers", href: "/suppliers", icon: Users },
  { key: "companies", label: "Companies", href: "/companies", icon: Building2 },
];

const popularSearches = ["Industrial Machinery", "Packaging Materials", "Electrical Equipment", "Textile Products", "Chemicals"];

const avatars = [
  { initials: "R", bg: "bg-brand" },
  { initials: "A", bg: "bg-accent" },
  { initials: "S", bg: "bg-slate-600" },
  { initials: "P", bg: "bg-amber-500" },
];

export default function Hero({ stats }) {
  const statCards = [
    { icon: Users, color: "text-brand bg-brand/10", value: `${stats.totalVendors.toLocaleString("en-IN")}+`, label: "Verified Suppliers" },
    { icon: Package, color: "text-accent bg-accent/10", value: `${stats.totalProducts.toLocaleString("en-IN")}+`, label: "Products Listed" },
    { icon: Building2, color: "text-brand bg-brand/10", value: `${stats.totalBuyers.toLocaleString("en-IN")}+`, label: "Registered Buyers" },
    { icon: MapPin, color: "text-violet-600 bg-violet-100", value: `${stats.totalCities.toLocaleString("en-IN")}+`, label: "Cities Covered" },
  ];
  const router = useRouter();
  const [mode, setMode] = useState("products");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const target = modes.find((m) => m.key === mode).href;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    router.push(`${target}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-white py-8">
      {/* Decorative wave shapes */}
      <div aria-hidden className="pointer-events-none absolute -left-32 bottom-0 h-72 w-[36rem] rounded-full bg-brand/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-10 -bottom-24 h-64 w-[30rem] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        {/* Left column */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm animate-fade-up">
            <Zap className="h-4 w-4 fill-brand text-brand" /> India&apos;s fastest-growing B2B marketplace
          </span>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.3] tracking-tight text-slate-900  md:text-5xl animate-fade-up [animation-delay:80ms]">
            Search Products,
            <br />
            <span className="text-brand">Suppliers</span> &amp; Businesses
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 animate-fade-up [animation-delay:140ms]">
            Connect with verified manufacturers, suppliers, wholesalers and service providers across India.
            Grow your business with trust, transparency and endless opportunities.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5 animate-fade-up [animation-delay:200ms]">
            <div className="flex gap-1 px-1 pb-2 pt-1">
              {modes.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    mode === m.key ? "bg-brand text-white" : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 border-t border-slate-100 p-2 sm:flex-row">
              <div className="relative flex-[2]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search products, e.g. "hydraulic pump"`}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <button
                type="submit"
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-brand-light to-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_20px_-8px_rgba(249,115,22,0.55)] hover:brightness-110"
              >
                <Search className="h-4 w-4" /> Search
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm animate-fade-up [animation-delay:240ms]">
            <span className="font-medium text-slate-500">Popular Searches:</span>
            {popularSearches.map((term) => (
              <Link
                key={term}
                href={`/products?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition-colors hover:border-brand hover:text-brand"
              >
                {term}
              </Link>
            ))}
          </div>

          <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 animate-fade-up [animation-delay:280ms]">
            {statCards.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", s.color)}>
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <dt className="font-display text-xl font-bold text-slate-900">{s.value}</dt>
                  <dd className="text-xs text-slate-500">{s.label}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* Right column: hero image with floating cards */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute -top-4 left-0 z-10 max-w-[180px]">
              <p className="text-xs font-semibold uppercase leading-relaxed text-slate-500">
                A Stronger <span className="text-brand">India</span> Through Stronger <span className="text-brand">Businesses</span>
              </p>
              <div className="mt-2 flex h-1 w-16 overflow-hidden rounded-full">
                <span className="w-1/3 bg-orange-500" />
                <span className="w-1/3 bg-white" />
                <span className="w-1/3 bg-green-600" />
              </div>
            </div>

            <div
              className="relative mx-auto aspect-[3/2] w-full max-w-xl"
              style={{
                WebkitMaskImage: "radial-gradient(ellipse 80% 85% at 55% 45%, black 60%, transparent 100%)",
                maskImage: "radial-gradient(ellipse 80% 85% at 55% 45%, black 60%, transparent 100%)",
              }}
            >
              <Image src="/rightsideimage.png" alt="Indian businesses and industry" fill className="object-contain" priority />
            </div>

            <div className="absolute right-0 top-4 z-10 flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg animate-float-slow">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-900">Verified Businesses</p>
                <p className="text-[11px] text-slate-500">Trusted by 1000+ companies</p>
              </div>
            </div>

            <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg animate-float-slow [animation-delay:1s]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-900">Quality Products</p>
                <p className="text-[11px] text-slate-500">Sourced from reliable suppliers</p>
              </div>
            </div>

            <div className="absolute bottom-2 right-4 z-10 flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg animate-float-slow [animation-delay:2s]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-900">Nationwide Network</p>
                <p className="text-[11px] text-slate-500">Across 100+ cities</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 animate-fade-up [animation-delay:320ms]">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {avatars.map((a) => (
                  <span
                    key={a.initials}
                    className={clsx("flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white", a.bg)}
                  >
                    {a.initials}
                  </span>
                ))}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white">
                  +1K
                </span>
              </div>
              <p className="tagline-rule text-[10px] font-semibold text-slate-400">Trusted by businesses across India</p>
            </div>
            <p className="font-script text-2xl text-brand">Build Bigger Together</p>
          </div>
        </div>
      </div>
    </section>
  );
}
