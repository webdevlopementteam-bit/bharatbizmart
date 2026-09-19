"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Building2, Package, Inbox, FileText, ReceiptText, CreditCard,
  TrendingUp, Users2, AlertTriangle, LifeBuoy, ArrowRight, ArrowUpRight,
} from "lucide-react";

const dayLabel = (isoDay) =>
  isoDay ? new Date(`${isoDay}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";

const cardConfig = [
  { key: "totalVendors", label: "Total Vendors", icon: Building2, color: "text-brand", bg: "bg-brand/10" },
  { key: "totalBuyers", label: "Total Buyers", icon: Users, color: "text-sky-600", bg: "bg-sky-100" },
  { key: "totalProducts", label: "Total Products", icon: Package, color: "text-violet-600", bg: "bg-violet-100" },
  { key: "totalEnquiries", label: "Total Enquiries", icon: Inbox, color: "text-emerald-600", bg: "bg-emerald-100" },
  { key: "totalRfqs", label: "Total RFQs", icon: FileText, color: "text-amber-600", bg: "bg-amber-100" },
  { key: "totalQuotations", label: "Total Quotations", icon: ReceiptText, color: "text-rose-600", bg: "bg-rose-100" },
  { key: "activeSubscriptions", label: "Active Subscriptions", icon: CreditCard, color: "text-indigo-600", bg: "bg-indigo-100" },
  { key: "totalUsers", label: "Total Users", icon: Users2, color: "text-slate-600", bg: "bg-slate-100" },
];

const STATUS_META = {
  approved: { label: "Approved", color: "#059669", bg: "bg-emerald-500" },
  pending_approval: { label: "Pending Approval", color: "#d97706", bg: "bg-amber-500" },
  suspended: { label: "Suspended", color: "#94a3b8", bg: "bg-slate-400" },
  rejected: { label: "Rejected", color: "#e11d48", bg: "bg-rose-500" },
};

const PLAN_META = {
  free: { label: "Free", color: "#94a3b8", bg: "bg-slate-400" },
  growth: { label: "Growth", color: "#0284c7", bg: "bg-sky-600" },
  premium: { label: "Premium", color: "#7c3aed", bg: "bg-violet-600" },
  enterprise: { label: "Enterprise", color: "#f97316", bg: "bg-brand" },
};

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setData);
  }, []);

  const cards = data?.cards || {};
  const vendorStatus = data?.vendorStatus || {};
  const planDistribution = data?.planDistribution || {};

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Platform Overview</h1>
          <p className="mt-1 text-sm text-slate-500">A live snapshot of everything happening across the marketplace.</p>
        </div>
        {cards.newRegistrations !== undefined && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <ArrowUpRight className="h-3.5 w-3.5" /> {cards.newRegistrations} new users in the last 30 days
          </span>
        )}
      </div>

      {/* Needs attention */}
      {(cards.pendingApprovals > 0 || cards.openSupportTickets > 0) && (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.pendingApprovals > 0 && (
            <AttentionCard
              icon={AlertTriangle}
              tone="amber"
              title={`${cards.pendingApprovals} vendor${cards.pendingApprovals === 1 ? "" : "s"} awaiting approval`}
              desc="Review documents and approve or reject new business registrations."
              href="/admin/vendors?status=pending_approval"
            />
          )}
          {cards.openSupportTickets > 0 && (
            <AttentionCard
              icon={LifeBuoy}
              tone="rose"
              title={`${cards.openSupportTickets} open support ticket${cards.openSupportTickets === 1 ? "" : "s"}`}
              desc="Buyers and sellers are waiting on a response from your team."
              href="/admin/support"
            />
          )}
        </div>
      )}

      {/* Revenue hero + KPI grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_2fr]">
        <div className="relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-[#1a1408] p-6 text-white shadow-lg">
          <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/20 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            <span className="text-[11px] text-slate-400">All-time</span>
          </div>
          <p className="relative mt-3 font-display text-3xl font-bold">₹{(cards.revenue || 0).toLocaleString("en-IN")}</p>
          <p className="relative mt-1 text-xs text-slate-400">Total Revenue Collected</p>

          <div className="relative mt-5">
            <MiniSparkline data={data?.charts?.revenueGrowth} valueKey="total" color="#fb923c" />
          </div>

          <div className="relative mt-auto grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
            <div>
              <p className="text-base font-bold">₹{(cards.revenueLast30Days || 0).toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-slate-400">Last 30 Days</p>
            </div>
            <div>
              <p className="text-base font-bold">{cards.payingVendors ?? 0}</p>
              <p className="text-[11px] text-slate-400">Paying Vendors</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cardConfig.map((c) => (
            <div key={c.key} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg} ${c.color}`}>
                <c.icon className="h-4.5 w-4.5" />
              </div>
              <p className="mt-2.5 text-xl font-bold text-slate-900">{cards[c.key] ?? "—"}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trend charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AreaChartCard title="User Registrations" subtitle="Last 30 days" data={data?.charts?.registrationGrowth} valueKey="count" color="#f97316" />
        <AreaChartCard title="Vendor Growth" subtitle="Last 30 days" data={data?.charts?.vendorGrowth} valueKey="count" color="#16a34a" />
        <AreaChartCard title="Revenue" subtitle="Last 30 days" data={data?.charts?.revenueGrowth} valueKey="total" color="#0284c7" prefix="₹" />
      </div>

      {/* Breakdown bars */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownCard title="Vendors by Status" meta={STATUS_META} values={vendorStatus} />
        <BreakdownCard title="Vendors by Plan" meta={PLAN_META} values={planDistribution} />
      </div>

      {/* Recent activity */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentListCard
          title="Recently Registered Vendors"
          href="/admin/vendors"
          items={data?.recentVendors}
          renderItem={(v) => (
            <>
              <div>
                <p className="text-sm font-medium text-slate-900">{v.businessName}</p>
                <p className="text-xs text-slate-400">{new Date(v.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
              <StatusPill status={v.status} />
            </>
          )}
        />
        <RecentListCard
          title="Recent Buying Requirements"
          href="/admin"
          items={data?.recentRfqs}
          renderItem={(r) => (
            <>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-400">by {r.buyer?.name || "Unknown"} · {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-600">{r.status}</span>
            </>
          )}
        />
      </div>
    </div>
  );
}

function AttentionCard({ icon: Icon, tone, title, desc, href }) {
  const toneClasses = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  }[tone];
  return (
    <Link href={href} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 transition-transform hover:-translate-y-0.5 ${toneClasses}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs opacity-80">{desc}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0" />
    </Link>
  );
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending_approval;
  return (
    <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ backgroundColor: meta.color }}>
      {meta.label}
    </span>
  );
}

function RecentListCard({ title, href, items, renderItem }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <Link href={href} className="flex items-center gap-1 text-xs font-medium text-brand hover:underline">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="mt-3 divide-y divide-slate-100">
        {!items?.length && <p className="py-6 text-center text-sm text-slate-400">Nothing here yet.</p>}
        {items?.map((item, i) => (
          <div key={item._id || i} className="flex items-center justify-between gap-3 py-2.5">
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

function BreakdownCard({ title, meta, values }) {
  const entries = Object.keys(meta).map((key) => ({ key, count: values[key] || 0, ...meta[key] }));
  const max = Math.max(1, ...entries.map((e) => e.count));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-5 space-y-4">
        {entries.map((e) => (
          <div key={e.key}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className={`h-2 w-2 rounded-full ${e.bg}`} /> {e.label}
              </span>
              <span className="font-semibold text-slate-900">{e.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${e.bg}`} style={{ width: `${Math.max(3, (e.count / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A single-series area chart. Per the platform's dataviz method: one hue,
 * a light wash fill, a 2px line, an end-marker with a surface ring, and the
 * value labelled only at the endpoint (never on every point) — the axis
 * carries the rest.
 */
function AreaChartCard({ title, subtitle, data, valueKey, color, prefix = "" }) {
  const width = 320;
  const height = 140;
  const padX = 8;
  const padY = 16;

  const points = data && data.length > 0 ? data : [];
  const values = points.map((d) => d[valueKey] || 0);
  const max = Math.max(1, ...values);

  const coords = points.map((d, i) => {
    const x = points.length > 1 ? padX + (i / (points.length - 1)) * (width - padX * 2) : width / 2;
    const y = padY + (1 - (d[valueKey] || 0) / max) * (height - padY * 2);
    return { x, y, value: d[valueKey] || 0, day: d.day };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = coords.length
    ? `${linePath} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`
    : "";

  const last = coords[coords.length - 1];
  const gradId = `grad-${title.replace(/\s/g, "")}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <span className="text-[11px] text-slate-400">{subtitle}</span>
      </div>

      {coords.length === 0 ? (
        <div className="mt-6 flex h-[140px] items-center justify-center text-sm text-slate-400">No data yet</div>
      ) : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="#e2e8f0" strokeWidth="1" />
            <path d={areaPath} fill={`url(#${gradId})`} />
            <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {last && (
              <>
                <circle cx={last.x} cy={last.y} r="5" fill={color} stroke="#fff" strokeWidth="2" />
              </>
            )}
          </svg>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>{dayLabel(coords[0]?.day)}</span>
            <span className="text-xs font-semibold text-slate-700">{prefix}{last?.value?.toLocaleString("en-IN")}</span>
            <span>{dayLabel(coords[coords.length - 1]?.day)}</span>
          </div>
        </>
      )}
    </div>
  );
}

/** A tiny inline trend line for a stat card — no axes, no labels, just shape. */
function MiniSparkline({ data, valueKey, color, height = 40 }) {
  const width = 260;
  const points = data && data.length > 0 ? data : [];
  if (points.length < 2) return <div style={{ height }} />;

  const max = Math.max(1, ...points.map((d) => d[valueKey] || 0));
  const coords = points.map((d, i) => ({
    x: (i / (points.length - 1)) * width,
    y: (1 - (d[valueKey] || 0) / max) * (height - 4) + 2,
  }));
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <path d={areaPath} fill={color} opacity="0.12" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
