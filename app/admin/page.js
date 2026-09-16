"use client";

import { useEffect, useState } from "react";
import { Users, Building2, Package, Inbox, FileText, ReceiptText, CreditCard, TrendingUp } from "lucide-react";

const cardConfig = [
  { key: "totalUsers", label: "Total Users", icon: Users },
  { key: "totalVendors", label: "Total Vendors", icon: Building2 },
  { key: "totalBuyers", label: "Total Buyers", icon: Users },
  { key: "totalProducts", label: "Total Products", icon: Package },
  { key: "totalEnquiries", label: "Total Enquiries", icon: Inbox },
  { key: "totalRfqs", label: "Total RFQs", icon: FileText },
  { key: "totalQuotations", label: "Total Quotations", icon: ReceiptText },
  { key: "activeSubscriptions", label: "Active Subscriptions", icon: CreditCard },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setData);
  }, []);

  const cards = data?.cards || {};

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Platform Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cardConfig.map((c) => (
          <div key={c.key} className="rounded-xl border border-slate-200 bg-white p-4">
            <c.icon className="h-5 w-5 text-brand" />
            <p className="mt-2 text-2xl font-bold text-slate-900">{cards[c.key] ?? "—"}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900">₹{(cards.revenue || 0).toLocaleString("en-IN")}</p>
          <p className="text-xs text-slate-500">Total Revenue</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Registration Growth" data={data?.charts?.registrationGrowth} />
        <ChartCard title="Vendor Growth" data={data?.charts?.vendorGrowth} />
      </div>
    </div>
  );
}

function ChartCard({ title, data }) {
  const max = Math.max(1, ...(data?.map((d) => d.count) || [1]));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 flex h-40 items-end gap-2">
        {data?.map((d) => (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
            <div className="w-full rounded-t bg-brand" style={{ height: `${(d.count / max) * 120}px` }} />
            <span className="text-[10px] text-slate-400">{d.month}</span>
          </div>
        ))}
        {!data?.length && <p className="text-sm text-slate-400">No data yet</p>}
      </div>
    </div>
  );
}
