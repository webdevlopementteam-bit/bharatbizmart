import Link from "next/link";
import Image from "next/image";
import { Users, Handshake, TrendingUp, ShieldCheck, Truck, Headphones, Lock, ArrowRight } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcons";
import Logo from "@/components/marketplace/Logo";
import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import User from "@/models/User";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "BharatBizMart";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/pages/about" },
      { label: "Blog & Insights", href: "/blog" },
      { label: "Contact Us", href: "/pages/contact" },
      { label: "Careers", href: "/pages/careers" },
    ],
  },
  {
    title: "For Buyers",
    links: [
      { label: "Browse Products", href: "/products" },
      { label: "Browse Suppliers", href: "/suppliers" },
      { label: "Post Requirement", href: "/post-requirement" },
      { label: "Buying Requests", href: "/rfq" },
      { label: "Compare Products", href: "/compare" },
    ],
  },
  {
    title: "For Sellers",
    links: [
      { label: "Sell on " + APP_NAME, href: "/register-business" },
      { label: "Seller Dashboard", href: "/dashboard" },
      { label: "Subscription Plans", href: "/pages/pricing" },
      { label: "Verification", href: "/pages/verification" },
    ],
  },
  {
    title: "Help & Legal",
    links: [
      { label: "Help Center", href: "/pages/help" },
      { label: "Privacy Policy", href: "/pages/privacy" },
      { label: "Terms of Service", href: "/pages/terms" },
      { label: "Refund Policy", href: "/pages/refund" },
      { label: "Sitemap", href: "/sitemap.xml" },
    ],
  },
];

const socialMeta = {
  facebook: "#1877F2",
  instagram: "#E1306C",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  twitter: "#0f172a",
};

export default async function Footer() {
  await connectDB();
  const [totalVendors, totalBuyers] = await Promise.all([
    Vendor.countDocuments({ status: "approved" }),
    User.countDocuments({ role: "buyer" }),
  ]);



  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      {/* Brand + link columns */}
      <div className="mx-auto  px-4 py-14  md:px-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Logo size="lg" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              India&apos;s trusted B2B marketplace connecting buyers with verified manufacturers, suppliers and service providers across India.
            </p>

            <div className="mt-5 flex gap-2.5">
              {Object.entries(socialMeta).map(([key, bg]) => (
                <span
                  key={key}
                  role="img"
                  aria-label={key}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:-translate-y-0.5"
                  style={{ background: bg }}
                >
                  <SocialIcon name={key} className="h-3.5 w-3.5" />
                </span>
              ))}
            </div>

          
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-slate-900">{col.title}</h4>
              <span className="mt-1.5 block h-0.5 w-6 rounded-full bg-brand" />
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-500 transition-colors hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA banner — the lion watermark gets real room to breathe here */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto  overflow-hidden rounded-3xl bg-orange-50">
          <Image
            src="/lionlogo.png"
            alt=""
            aria-hidden="true"
            width={900}
            height={600}
            className="pointer-events-none absolute -bottom-8 -right-3 h-52 w-auto opacity-[0.16] grayscale sm:h-64 lg:h-72"
          />
          <div className="relative flex flex-col gap-6 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
            <div className="max-w-xl">
              <span className="block h-0.5 w-8 rounded-full bg-brand" />
              <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                Let&apos;s Build a <span className="text-brand">Stronger India</span>
              </h3>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Join thousands of businesses growing together with {APP_NAME}.
              </p>
              <Link
                href="/register-business"
                className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Become a Supplier <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 bg-slate-50 py-6 text-center">
        <p className="font-display text-sm italic text-slate-500 sm:text-base">&ldquo;Empowering Indian Businesses for a Brighter Tomorrow&rdquo;</p>
        <span className="mx-auto mt-2 block h-0.5 w-8 rounded-full bg-brand" />
      </div>

      <div className="bg-[#0b1220] py-4">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-3 px-4 text-xs text-slate-400 sm:grid-cols-3 sm:px-6 lg:px-8">
          <p className="text-center sm:text-left">&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <span className="flex items-center justify-center gap-1.5"><Lock className="h-3.5 w-3.5" />Secure &amp; Trusted Platform</span>
          <div className="flex items-center justify-center gap-2 sm:justify-end">
            {[
              { name: "Visa", src: "/visa.webp", w: "w-14" },
              { name: "Mastercard", src: "/mastercard.webp", w: "w-11" },
              { name: "RuPay", src: "/rupay.webp", w: "w-14" },
              { name: "UPI", src: "/upi.webp", w: "w-14" },
            ].map((p) => (
              <span key={p.name} className={`flex h-9 ${p.w} items-center justify-center rounded-md bg-white p-1.5 shadow-sm`}>
                <Image src={p.src} alt={p.name} width={120} height={80} className="h-full w-full object-contain" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
