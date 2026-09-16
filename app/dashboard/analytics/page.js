"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/vendor/analytics").then((r) => r.json()).then(setData);
  }, []);

  const cards = data?.cards || {};
  const maxLead = Math.max(1, ...(data?.charts?.leadsByDay?.map((d) => d.count) || [1]));

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Object.entries(cards).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs capitalize text-slate-500">{key.replace(/([A-Z])/g, " $1")}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Leads Trend (30 days)</h2>
        <div className="mt-4 flex h-48 items-end gap-1">
          {data?.charts?.leadsByDay?.map((d) => (
            <div key={d.date} className="group relative flex-1">
              <div className="rounded-t bg-brand transition-all group-hover:bg-brand-dark" style={{ height: `${(d.count / maxLead) * 160}px` }} />
              <span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 text-xs text-slate-500 group-hover:block">{d.count}</span>
            </div>
          ))}
          {!data?.charts?.leadsByDay?.length && <p className="text-sm text-slate-400">No data yet</p>}
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400">
        Website traffic and conversion-rate analytics unlock on the Growth plan and above.{" "}
        <a href="/dashboard/subscription" className="text-brand hover:underline">Upgrade your plan</a>.
      </p>
    </div>
  );
}
