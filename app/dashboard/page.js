"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Package, Users2, Inbox, ReceiptText, Globe, PhoneCall } from "lucide-react";

const cardConfig = [
  { key: "profileViews", label: "Profile Views", icon: Eye },
  { key: "productViews", label: "Product Views", icon: Package },
  { key: "leads", label: "Active Leads", icon: Users2 },
  { key: "enquiries", label: "Enquiries (30d)", icon: Inbox },
  { key: "products", label: "Products", icon: Package },
  { key: "quotations", label: "Quotations Sent", icon: ReceiptText },
  { key: "websiteVisitors", label: "Website Visitors", icon: Globe },
  { key: "calls", label: "Calls", icon: PhoneCall },
];

export default function DashboardOverviewPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/vendor/analytics").then((r) => r.json()).then((d) => setData(d));
  }, []);

  const cards = data?.cards || {};

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Overview</h1>
      <p className="mt-1 text-sm text-slate-500">A snapshot of your business performance.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cardConfig.map((c) => (
          <div key={c.key} className="rounded-xl border border-slate-200 bg-white p-4">
            <c.icon className="h-5 w-5 text-brand" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{cards[c.key] ?? "—"}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Leads in the last 30 days</h2>
        {data?.charts?.leadsByDay?.length ? (
          <div className="mt-4 flex h-40 items-end gap-1">
            {data.charts.leadsByDay.map((d) => (
              <div key={d.date} className="flex-1 rounded-t bg-brand/70" style={{ height: `${Math.max(6, d.count * 20)}px` }} title={`${d.date}: ${d.count}`} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">No lead activity yet.</p>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink href="/dashboard/products/new" title="Add a Product" desc="List a new product to start getting enquiries." />
        <QuickLink href="/dashboard/website" title="Customize Website" desc="Personalize your auto-generated business website." />
        <QuickLink href="/dashboard/business" title="Complete Verification" desc="Upload documents to get your Verified badge." />
      </div>
    </div>
  );
}

function QuickLink({ href, title, desc }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand hover:shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
    </Link>
  );
}
