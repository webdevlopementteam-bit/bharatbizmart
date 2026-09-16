import Link from "next/link";
import { connectDB } from "@/lib/db/connect";
import Category from "@/models/Category";
import Vendor from "@/models/Vendor";
import Product from "@/models/Product";
import RFQ from "@/models/RFQ";
import Location from "@/models/Location";
import Review from "@/models/Review";
import Advertisement from "@/models/Advertisement";
import Blog from "@/models/Blog";
import User from "@/models/User";
import Enquiry from "@/models/Enquiry";
import Hero from "@/components/marketplace/Hero";
import LogoMarquee from "@/components/marketplace/LogoMarquee";
import HowItWorks from "@/components/marketplace/HowItWorks";
import TopSuppliersByCategory from "@/components/marketplace/TopSuppliersByCategory";
import TrustExplainer from "@/components/marketplace/TrustExplainer";
import FAQAccordion from "@/components/marketplace/FAQAccordion";
import NewsletterSignup from "@/components/marketplace/NewsletterSignup";
import CategoryCard from "@/components/marketplace/CategoryCard";
import SupplierCard from "@/components/marketplace/SupplierCard";
import ProductCard from "@/components/marketplace/ProductCard";
import Button from "@/components/ui/Button";
import Rating from "@/components/ui/Rating";
import Image from "next/image";
import {
  ShieldCheck, Users, TrendingUp, Headset, ArrowRight, MapPin, Quote, Sparkles, CalendarDays,
  Globe, Zap, Building2, ShoppingBag, Package, Shirt, Car, Cpu, Box,
  Cog, FlaskConical, Wheat, Stethoscope, Star, Play,
} from "lucide-react";

// Matches the `icon` string stored on each Category document (see
// scripts/seed.js CATEGORY_TREE / admin category form) to the actual lucide
// component, so a requirement's card always shows an icon for its real
// category instead of a decorative one — falls back to a generic box for
// requirements posted without a category.
const CATEGORY_ICONS = { Cog, Zap, Building2, Package, FlaskConical, Cpu, Car, Shirt, Wheat, Stethoscope };

export const revalidate = 60;

async function getHomeData() {
  await connectDB();

  const promotedAds = await Advertisement.find({ type: "featured_supplier", status: "active", endDate: { $gte: new Date() } })
    .select("vendor")
    .lean();
  const promotedVendorIds = promotedAds.map((a) => a.vendor);

  const [
    categories,
    promotedVendors,
    otherVendors,
    trendingProducts,
    newArrivals,
    recentRfqs,
    popularLocations,
    testimonials,
    latestPosts,
    logoVendors,
    totalVendors,
    totalProducts,
    totalBuyers,
    totalCities,
    totalCategories,
    totalEnquiries,
  ] = await Promise.all([
    Category.find({ parent: null, status: "active" }).sort({ order: 1 }).limit(10).lean(),
    promotedVendorIds.length
      ? Vendor.find({ _id: { $in: promotedVendorIds }, status: "approved" }).lean()
      : Promise.resolve([]),
    Vendor.find({ status: "approved", _id: { $nin: promotedVendorIds } })
      .sort({ ratingAverage: -1, createdAt: -1 })
      .limit(8 - Math.min(promotedVendorIds.length, 8))
      .lean(),
    Product.find({ status: "active" }).sort({ isFeatured: -1, viewCount: -1 }).limit(10).populate("vendor", "businessName slug city state verification").lean(),
    Product.find({ status: "active" }).sort({ createdAt: -1 }).limit(10).populate("vendor", "businessName slug city state verification").lean(),
    RFQ.find({ status: "open" }).sort({ createdAt: -1 }).limit(6).populate("buyer", "name").populate("category", "name icon").lean(),
    Location.find({ isPopular: true }).sort({ vendorCount: -1 }).limit(12).lean(),
    Review.find({ status: "approved", rating: { $gte: 4 } }).sort({ createdAt: -1 }).limit(6).populate("buyer", "name").populate("vendor", "businessName").lean(),
    Blog.find({ status: "published" }).sort({ publishedAt: -1 }).limit(3).populate("author", "name").lean(),
    Vendor.find({ status: "approved" }).sort({ createdAt: -1 }).limit(100).select("businessName logo").lean(),
    Vendor.countDocuments({ status: "approved" }),
    Product.countDocuments({ status: "active" }),
    User.countDocuments({ role: "buyer" }),
    Location.countDocuments(),
    Category.countDocuments({ status: "active" }),
    Enquiry.countDocuments(),
  ]);

  const featuredVendors = [...promotedVendors, ...otherVendors].slice(0, 8);

  return {
    categories,
    featuredVendors,
    promotedCount: promotedVendors.length,
    trendingProducts,
    newArrivals,
    recentRfqs,
    popularLocations,
    testimonials,
    latestPosts,
    logoVendors,
    stats: { totalVendors, totalProducts, totalBuyers, totalCities, totalCategories, totalEnquiries },
  };
}

export default async function HomePage() {
  const {
    categories, featuredVendors, promotedCount, trendingProducts, newArrivals, recentRfqs,
    popularLocations, testimonials, latestPosts, logoVendors, stats,
  } = await getHomeData();

  const topCategoriesForTabs = JSON.parse(JSON.stringify(categories.slice(0, 6)));

  return (
    <div>
      <Hero stats={stats} />

      <LogoMarquee vendors={JSON.parse(JSON.stringify(logoVendors))} />

      <Section title="Popular Categories" subtitle="Browse thousands of products by category" href="/categories">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard key={c._id} category={JSON.parse(JSON.stringify(c))} />
          ))}
        </div>
      </Section>

      

      <Section
        title="Featured Suppliers"
        subtitle={promotedCount > 0 ? `${promotedCount} promoted + top-rated verified businesses` : "Verified businesses trusted by buyers"}
        href="/suppliers"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredVendors.map((v) => (
            <SupplierCard key={v._id} vendor={JSON.parse(JSON.stringify(v))} />
          ))}
        </div>
        {featuredVendors.length === 0 && <EmptyRow text="No suppliers yet. Be the first to register your business." />}
      </Section>
     <section id="how-it-works" className="relative overflow-hidden bg-slate-50 py-20 scroll-mt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 hidden h-56 w-56 sm:block"
          style={{ backgroundImage: "radial-gradient(circle, rgba(100,116,139,0.2) 1px, transparent 1px)", backgroundSize: "14px 14px" }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand">
              <span className="h-px w-4 bg-brand/40" /> Simple Process, Big Opportunities <span className="h-px w-4 bg-brand/40" />
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              How <span className="text-brand">BharatBizMart</span> Works
            </h2>
            <p className="mt-3 text-sm text-slate-500 sm:text-base">
              From search to sale, connect, compare and grow your business in a few simple steps.
            </p>
          </div>
          <div className="mt-16">
            <HowItWorks />
          </div>
        </div>
      </section>
      <Section title="Trending Products" subtitle="Popular right now across the marketplace" href="/products?sort=popular">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {trendingProducts.map((p) => (
            <ProductCard key={p._id} product={JSON.parse(JSON.stringify(p))} />
          ))}
        </div>
        {trendingProducts.length === 0 && <EmptyRow text="No products listed yet." />}
      </Section>

 

      {topCategoriesForTabs.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Top Suppliers by Category</h2>
              <p className="mt-2 text-sm text-slate-500">Explore the highest-rated verified businesses in each category.</p>
            </div>
            <div className="mt-8">
              <TopSuppliersByCategory categories={topCategoriesForTabs} />
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-white py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 sm:block"
          style={{ backgroundImage: "radial-gradient(circle, rgba(100,116,139,0.18) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                <span className="h-px w-6 bg-brand" /> Buyer Requirements
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                Latest <span className="text-brand">Buyer Requirements</span>
              </h2>
              <p className="mt-3 max-w-lg text-sm text-slate-500 sm:text-base">
                Explore genuine buying requirements from businesses across India and grow your sales.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative hidden items-center gap-3 lg:flex">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-lg">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <p className="font-script -rotate-3 text-xl leading-tight text-slate-500">
                  Connect with<br />genuine buyers
                </p>
              </div>
              <Link
                href="/rfq"
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
              >
                View All Requirements <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentRfqs.map((r, i) => {
              const colorSet = [
                { bg: "bg-sky-100", text: "text-sky-600" },
                { bg: "bg-violet-100", text: "text-violet-600" },
                { bg: "bg-orange-100", text: "text-orange-600" },
                { bg: "bg-red-100", text: "text-red-600" },
                { bg: "bg-blue-100", text: "text-blue-600" },
                { bg: "bg-emerald-100", text: "text-emerald-600" },
              ][i % 6];
              const CategoryIcon = CATEGORY_ICONS[r.category?.icon] || Package;
              const badgeSet = [
                { label: "Bulk Requirement", tone: "bg-sky-50 text-sky-700" },
                { label: "Verified Buyer", tone: "bg-emerald-50 text-emerald-700" },
                { label: "Active", tone: "bg-orange-50 text-orange-700" },
                { label: "Urgent", tone: "bg-red-50 text-red-700" },
              ][i % 4];
              return (
                <div key={r._id} className="card-premium flex flex-col gap-4 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorSet.bg} ${colorSet.text}`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold leading-snug text-slate-900">{r.title}</h3>
                    </div>
                    <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${badgeSet.tone}`}>{badgeSet.label}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    {r.quantity && (
                      <span className="flex items-center gap-1"><Box className="h-3.5 w-3.5" />Qty: {r.quantity}</span>
                    )}
                    {r.quantity && r.deliveryLocation && <span className="text-slate-300">|</span>}
                    {r.deliveryLocation && (
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{r.deliveryLocation}</span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <Link href={`/rfq/${r._id}`} className="text-sm font-semibold text-brand hover:underline">
                      Submit a quotation →
                    </Link>
                    <Link
                      href={`/rfq/${r._id}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors hover:bg-brand hover:text-white"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          {recentRfqs.length === 0 && <EmptyRow text="No buying requirements posted yet." />}
        </div>
      </section>

      <Section title="Buy With Confidence" subtitle="Every badge means we've checked something real">
        <TrustExplainer />
      </Section>
     <Section title="New Arrivals" subtitle="Freshly listed products from our sellers" href="/products?sort=newest">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {newArrivals.map((p) => (
            <ProductCard key={p._id} product={JSON.parse(JSON.stringify(p))} />
          ))}
        </div>
        {newArrivals.length === 0 && <EmptyRow text="No products listed yet." />}
      </Section>
      <Section title="Popular Cities" subtitle="Find suppliers near your city">
        <div className="flex flex-wrap gap-2">
          {popularLocations.map((l) => (
            <Link
              key={l._id}
              href={`/products?city=${encodeURIComponent(l.city)}`}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-colors hover:border-brand hover:text-brand"
            >
              <MapPin className="h-3.5 w-3.5" /> {l.city}
            </Link>
          ))}
        </div>
        {popularLocations.length === 0 && <EmptyRow text="Popular cities will appear here once added by admin." />}
      </Section>

      <section className="relative overflow-hidden bg-white py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{ backgroundImage: "radial-gradient(circle, rgba(100,116,139,0.18) 1px, transparent 1px)", backgroundSize: "16px 16px", maskImage: "radial-gradient(ellipse 700px 500px at 78% 50%, black, transparent)" }}
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
              <Star className="h-3.5 w-3.5 fill-brand" /> Why BharatBizMart <span className="ml-1 h-px w-8 bg-brand/30" />
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Built for Businesses.<br />
              <span className="text-brand">Trusted</span> by India.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
              {process.env.NEXT_PUBLIC_APP_NAME || "BharatBizMart"} connects genuine buyers and verified suppliers, making B2B trade simple, transparent and growth-focused.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6 sm:gap-8">
              {[
                { value: `${stats.totalVendors.toLocaleString("en-IN")}+`, label: "Verified Suppliers", color: "text-brand" },
                { value: `${stats.totalEnquiries.toLocaleString("en-IN")}+`, label: "Business Enquiries", color: "text-slate-900" },
                { value: `${stats.totalCategories.toLocaleString("en-IN")}+`, label: "Product Categories", color: "text-accent" },
              ].map((s, i) => (
                <div key={s.label} className={i > 0 ? "border-l border-slate-200 pl-6 sm:pl-8" : ""}>
                  <p className={`font-display text-2xl font-bold sm:text-3xl ${s.color}`}>{s.value}</p>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/register-business"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5"
              >
                Join {process.env.NEXT_PUBLIC_APP_NAME || "BharatBizMart"} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="group flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </span>
                Watch How It Works
              </a>
            </div>

            <div className="mt-10 hidden items-center gap-3 sm:flex">
              <span className="h-px w-10 bg-slate-300" />
              <p className="font-script -rotate-2 text-lg leading-tight text-slate-400">India&apos;s Growth<br />Our Priority</p>
            </div>
          </div>

          <div className="relative mx-auto hidden aspect-square w-full max-w-[620px] lg:block">
            <div className="grid h-full grid-cols-2 gap-7">
              {[
                { icon: ShieldCheck, title: "Verified Suppliers", desc: "GST & business verification for every listed supplier, ensuring safe and reliable transactions.", color: "orange", href: "/suppliers" },
                { icon: Users, title: "Wide Network", desc: "Thousands of manufacturers, dealers and service providers across India, all in one place.", color: "green", href: "/suppliers" },
                { icon: TrendingUp, title: "Quality Leads", desc: "Get relevant enquiries and RFQs matched to your business, helping you grow faster.", color: "violet", href: "/rfq" },
                { icon: Headset, title: "Dedicated Support", desc: "Our support team is always ready to help you, ensuring a smooth and hassle-free experience.", color: "blue", href: "/pages/contact" },
              ].map((f, i) => {
                const palette = {
                  orange: { card: "bg-orange-50/80 border-orange-100", iconBg: "bg-brand", ghost: "text-orange-200", btn: "bg-brand text-white" },
                  green: { card: "bg-green-50/80 border-green-100", iconBg: "bg-accent", ghost: "text-green-200", btn: "bg-accent text-white" },
                  violet: { card: "bg-violet-50/80 border-violet-100", iconBg: "bg-violet-500", ghost: "text-violet-200", btn: "bg-violet-500 text-white" },
                  blue: { card: "bg-sky-50/80 border-sky-100", iconBg: "bg-sky-500", ghost: "text-sky-200", btn: "bg-sky-500 text-white" },
                }[f.color];
                return (
                  <div
                    key={f.title}
                    className={`relative flex flex-col justify-center rounded-2xl border p-5 shadow-sm backdrop-blur-sm ${palette.card} ${i % 2 === 0 ? "-translate-y-5" : "translate-y-5"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md ${palette.iconBg}`}>
                        <f.icon className="h-5 w-5" />
                      </div>
                      <span className={`font-display text-3xl font-bold ${palette.ghost}`}>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-slate-900">{f.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{f.desc}</p>
                    <Link href={f.href} className={`mt-4 flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-105 ${palette.btn}`}>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <Section title="What Buyers Are Saying" subtitle="Real feedback from verified purchases">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t._id} className="card-premium rounded-2xl p-5">
                <Quote className="h-5 w-5 text-brand/40" />
                <p className="mt-2 line-clamp-4 text-sm text-slate-600">&quot;{t.comment}&quot;</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.buyer?.name}</p>
                    <p className="text-xs text-slate-500">on {t.vendor?.businessName}</p>
                  </div>
                  <Rating value={t.rating} showCount={false} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {latestPosts.length > 0 && (
        <Section title="From Our Blog" subtitle="Guides and insights for B2B buyers and sellers" href="/blog">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {latestPosts.map((p) => (
              <Link key={p._id} href={`/blog/${p.slug}`} className="card-premium overflow-hidden rounded-2xl">
                <div className="relative aspect-video bg-slate-100">
                  {p.featuredImage && <Image src={p.featuredImage} alt={p.title} fill className="object-cover" />}
                </div>
                <div className="p-4">
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(p.publishedAt || p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="Frequently Asked Questions" subtitle="Everything you need to know to get started">
        <FAQAccordion />
      </Section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            <Sparkles className="h-3.5 w-3.5" /> Stay in the loop
          </span>
          <h2 className="mt-3 font-display text-2xl font-bold text-slate-900">Get sourcing tips &amp; platform updates</h2>
          <p className="mt-2 text-sm text-slate-500">Join our newsletter — no spam, unsubscribe anytime.</p>
          <div className="mt-6">
            <NewsletterSignup />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div aria-hidden className="absolute inset-0 gradient-brand" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-black/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> All-in-One B2B Solution
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Grow Your Business With Our <span className="text-amber-300">B2B Marketplace</span>
            </h2>
            <p className="mt-4 max-w-md text-sm text-orange-50/90 sm:text-base">
              Get your own business website, reach thousands of verified buyers, and manage leads — all in one powerful dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white">
              <span className="flex items-center gap-2"><Building2 className="h-4 w-4 shrink-0" />Your Own Business Website</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0" />Reach Verified Buyers</span>
              <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 shrink-0" />Manage Leads &amp; Grow Sales</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register-business"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5"
              >
                Register Your Business <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-xs text-orange-50/80">It&apos;s quick, easy, and free to get started!</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { icon: ShieldCheck, title: "Trusted by Businesses", desc: "Across India" },
              { icon: Globe, title: "Expand Your Reach", desc: "Globally" },
              { icon: Zap, title: "Easy Setup", desc: "No technical skills required" },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-orange-50/80">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, subtitle, href, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href} className="hidden shrink-0 items-center gap-1 text-sm font-medium text-brand hover:underline sm:flex">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyRow({ text }) {
  return <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-8 text-center text-sm text-slate-400">{text}</p>;
}
