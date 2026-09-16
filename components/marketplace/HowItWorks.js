"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  Search, MessageSquarePlus, ReceiptText, Handshake, Building2, ShieldCheck,
  PackagePlus, TrendingUp, ChevronRight, Package, Users, Headset,
} from "lucide-react";

const flows = {
  buyers: {
    label: "For Buyers",
    steps: [
      { icon: Search, title: "Search & Compare", desc: "Find products and verified suppliers, filter by location, price and business type." },
      { icon: MessageSquarePlus, title: "Send Enquiry or Post a Requirement", desc: "Contact suppliers directly, or post a buying requirement for matching vendors to quote on." },
      { icon: ReceiptText, title: "Get Quotations", desc: "Receive detailed quotations with pricing, GST, delivery time and payment terms." },
      { icon: Handshake, title: "Finalize the Deal", desc: "Chat, negotiate, and close the deal directly with the supplier — no middleman." },
    ],
  },
  sellers: {
    label: "For Sellers",
    steps: [
      { icon: Building2, title: "Register Your Business", desc: "Complete the seller onboarding wizard with your business and GST details." },
      { icon: ShieldCheck, title: "Get Verified", desc: "Submit documents for admin review and earn your Verified Supplier badge." },
      { icon: PackagePlus, title: "List Products & Services", desc: "Add your catalog and get your own auto-generated business website instantly." },
      { icon: TrendingUp, title: "Receive Leads & Grow", desc: "Get enquiries, RFQs and quotations requests from buyers actively searching." },
    ],
  },
};

const stepColors = [
  { ghost: "text-orange-500/20", grad: "from-orange-400 to-orange-600", puck: "bg-orange-200/60" },
  { ghost: "text-blue-500/20", grad: "from-blue-400 to-blue-600", puck: "bg-blue-200/60" },
  { ghost: "text-green-500/20", grad: "from-green-400 to-green-600", puck: "bg-green-200/60" },
  { ghost: "text-violet-500/20", grad: "from-violet-400 to-violet-600", puck: "bg-violet-200/60" },
];

const trustStrip = [
  { icon: ShieldCheck, title: "Verified Suppliers", desc: "Trusted & Reliable" },
  { icon: Package, title: "Wide Product Range", desc: "Across Industries" },
  { icon: Users, title: "Secure & Transparent", desc: "Business Transactions" },
  { icon: Headset, title: "Dedicated Support", desc: "Always Here to Help" },
];

export default function HowItWorks() {
  const [tab, setTab] = useState("buyers");
  const active = flows[tab];

  return (
    <div>
      <div className="mx-auto flex w-fit gap-1 rounded-full border border-slate-200 bg-white p-1">
        {Object.entries(flows).map(([key, f]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              tab === key ? "bg-brand text-white" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative mt-16">
        {/* Dashed connector with chevron bubbles, aligned to the icon row's center */}
        <div className="pointer-events-none absolute inset-x-[12.5%] top-8 hidden border-t-2 border-dashed border-slate-300 lg:block" />
        <div className="pointer-events-none absolute top-8 hidden w-full lg:block">
          {[25, 50, 75].map((pos) => (
            <span
              key={pos}
              className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-400 shadow-md ring-1 ring-slate-100"
              style={{ left: `${pos}%` }}
            >
              <ChevronRight className="h-4 w-4" />
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {active.steps.map((s, i) => {
            const c = stepColors[i];
            return (
              <div key={s.title} className="relative flex flex-col items-center text-center">
                <div className="relative flex h-16 items-center justify-center">
                  <span className={`absolute -left-3 -top-12 font-display text-5xl font-bold ${c.ghost} sm:-left-5`}>{String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden className={`absolute -bottom-2 h-4 w-20 rounded-full blur-md ${c.puck}`} />
                  <div className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br shadow-lg ${c.grad}`}>
                    <s.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-900">{s.title}</h3>
                <span className="mt-2 h-0.5 w-6 rounded-full bg-brand" />
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 rounded-2xl bg-brand/5 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-brand/10">
        {trustStrip.map((t) => (
          <div key={t.title} className="flex items-center gap-3 lg:pl-6 lg:first:pl-0">
            <t.icon className="h-6 w-6 shrink-0 text-brand" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              <p className="text-xs text-slate-500">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
