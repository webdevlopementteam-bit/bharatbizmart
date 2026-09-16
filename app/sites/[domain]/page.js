import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSiteContext } from "@/lib/tenant/getSiteContext";
import Product from "@/models/Product";
import Service from "@/models/Service";
import ProductCard from "@/components/marketplace/ProductCard";
import Rating from "@/components/ui/Rating";
import { VerificationBadge } from "@/components/ui/Badge";
import { ShieldCheck, Star, MapPin, CalendarDays, ArrowRight, Package, Wrench, Quote } from "lucide-react";

export async function generateMetadata({ params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  if (!site) return {};
  return {
    title: site.website.seo?.title || site.vendor.businessName,
    description: site.website.seo?.description || site.vendor.description?.slice(0, 155),
  };
}

export default async function VendorHomePage({ params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  if (!site) notFound();

  const isServiceVendor = site.vendor.businessType === "service_provider";

  const [products, services, productCount, serviceCount] = await Promise.all([
    isServiceVendor ? Promise.resolve([]) : Product.find({ vendor: site.vendor._id, status: "active" }).limit(8).lean(),
    isServiceVendor ? Service.find({ vendor: site.vendor._id, status: "active" }).limit(8).lean() : Promise.resolve([]),
    isServiceVendor ? Promise.resolve(0) : Product.countDocuments({ vendor: site.vendor._id, status: "active" }),
    isServiceVendor ? Service.countDocuments({ vendor: site.vendor._id, status: "active" }) : Promise.resolve(0),
  ]);

  const data = JSON.parse(JSON.stringify({ vendor: site.vendor, website: site.website, products, services }));
  const { vendor, website } = data;

  const catalogHref = isServiceVendor ? "/services" : "/products";
  const catalogLabel = isServiceVendor ? "View Services" : "View Products";
  const catalogCount = isServiceVendor ? serviceCount : productCount;
  const businessTypeLabel = vendor.businessType?.replace("_", " ");

  // Prefer a real product photo the vendor uploaded; fall back through
  // service/cover/logo images so the hero never ships an empty column.
  const heroImage =
    data.products.find((p) => p.images?.[0])?.images?.[0] ||
    data.services.find((s) => s.images?.[0])?.images?.[0] ||
    vendor.coverImage ||
    vendor.logo ||
    null;

  return (
    <div>
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-14">
          <div className="text-center lg:text-left">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ background: "color-mix(in srgb, var(--site-primary) 10%, white)", color: "var(--site-primary)" }}
            >
              {isServiceVendor ? <Wrench className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
              {businessTypeLabel}
            </span>

            <h1 className="mt-5 font-display text-4xl font-bold text-slate-900 sm:text-5xl">{vendor.businessName}</h1>
            {(website.tagline || vendor.tagline) && (
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500 sm:text-base lg:mx-0">{website.tagline || vendor.tagline}</p>
            )}

            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 lg:mx-0 lg:justify-start">
              {vendor.city && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" style={{ color: "var(--site-primary)" }} />{vendor.city}, {vendor.state}</span>
              )}
              {vendor.establishedYear && (
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" style={{ color: "var(--site-primary)" }} />Since {vendor.establishedYear}</span>
              )}
              {vendor.ratingCount > 0 && (
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{vendor.ratingAverage.toFixed(1)} ({vendor.ratingCount} reviews)</span>
              )}
            </div>

            {vendor.verification?.badges?.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5 lg:justify-start">
                {vendor.verification.badges.map((b) => (
                  <VerificationBadge key={b} badge={b} />
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link href={catalogHref} className="rounded-xl px-6 py-3 text-sm font-semibold text-white" style={{ background: "var(--site-primary)" }}>
                {catalogLabel} {catalogCount > 0 ? `(${catalogCount})` : ""}
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border px-6 py-3 text-sm font-semibold"
                style={{ borderColor: "var(--site-primary)", color: "var(--site-primary)" }}
              >
                {isServiceVendor ? "Get a Free Consultation" : "Contact Us"}
              </Link>
            </div>
          </div>

          {heroImage && (
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200 lg:max-w-none">
              <Image src={heroImage} alt={vendor.businessName} fill priority className="object-cover" />
            </div>
          )}
        </div>
      </section>

      {(website.aboutContent || vendor.description) && (
        <section className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6">
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{website.aboutContent || vendor.description}</p>
        </section>
      )}

      {!isServiceVendor && data.products.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-slate-900">Featured Products</h2>
            <Link href="/products" className="hidden items-center gap-1 text-sm font-medium sm:flex" style={{ color: "var(--site-primary)" }}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data.products.map((p) => <ProductCard key={p._id} product={{ ...p, vendor }} />)}
          </div>
        </section>
      )}

      {isServiceVendor && data.services.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold text-slate-900">Our Services</h2>
            <Link href="/services" className="hidden items-center gap-1 text-sm font-medium sm:flex" style={{ color: "var(--site-primary)" }}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.services.map((s) => (
              <div key={s._id} className="card-premium rounded-2xl p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "color-mix(in srgb, var(--site-primary) 12%, white)", color: "var(--site-primary)" }}>
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">{s.name}</h3>
                <p className="mt-1 line-clamp-3 text-xs text-slate-500">{s.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {website.whyChooseUs?.length > 0 && (
        <section className="bg-slate-50 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center font-display text-2xl font-bold text-slate-900">Why Choose Us</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {website.whyChooseUs.map((w, i) => (
                <div key={i} className="card-premium rounded-2xl p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "color-mix(in srgb, var(--site-primary) 12%, white)", color: "var(--site-primary)" }}>
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">{w.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{w.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {website.testimonials?.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold text-slate-900">What Our Clients Say</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {website.testimonials.map((t, i) => (
              <div key={i} className="card-premium rounded-2xl p-5">
                <Quote className="h-5 w-5 opacity-40" style={{ color: "var(--site-primary)" }} />
                <p className="mt-2 text-sm text-slate-600">&quot;{t.text}&quot;</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800">{t.name}{t.company ? `, ${t.company}` : ""}</p>
                  <Rating value={t.rating || 5} showCount={false} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div
          className="rounded-2xl border px-6 py-12 text-center"
          style={{ borderColor: "color-mix(in srgb, var(--site-primary) 25%, white)", background: "color-mix(in srgb, var(--site-primary) 4%, white)" }}
        >
          <h2 className="font-display text-2xl font-bold text-slate-900">
            {isServiceVendor ? "Need our services?" : "Interested in our products?"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">We usually respond within a few hours.</p>
          <Link href="/contact" className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white" style={{ background: "var(--site-primary)" }}>
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
