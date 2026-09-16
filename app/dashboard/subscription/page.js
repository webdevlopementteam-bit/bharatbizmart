"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import clsx from "clsx";

export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [upgrading, setUpgrading] = useState(null);

  const load = () => {
    fetch("/api/subscription-plans").then((r) => r.json()).then((d) => setPlans(d.plans || []));
    fetch("/api/vendor/subscription").then((r) => r.json()).then((d) => {
      setCurrent(d.subscription);
      setInvoices(d.invoices || []);
    });
  };
  useEffect(load, []);

  const upgrade = async (planKey) => {
    setUpgrading(planKey);
    try {
      const res = await fetch("/api/vendor/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success(`Switched to ${planKey} plan`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Subscription</h1>
      <p className="mt-1 text-sm text-slate-500">Current plan: <strong className="capitalize">{current?.planKey || "free"}</strong></p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <div key={p.key} className={clsx("rounded-xl border p-4", current?.planKey === p.key ? "border-brand ring-2 ring-brand/20" : "border-slate-200 bg-white")}>
            <p className="font-semibold text-slate-900">{p.name}</p>
            <p className="mt-1 text-lg font-bold text-brand">₹{p.price}<span className="text-xs text-slate-400">/{p.billingCycle}</span></p>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              {(p.features || []).map((f) => <li key={f}>• {f}</li>)}
              <li>• Up to {p.limits?.products} products</li>
              <li>• {p.limits?.leadsPerMonth} leads/mo</li>
              {p.limits?.customDomain && <li>• Custom domain</li>}
            </ul>
            <Button
              size="sm"
              className="mt-4 w-full"
              variant={current?.planKey === p.key ? "outline" : "primary"}
              disabled={current?.planKey === p.key || upgrading === p.key}
              onClick={() => upgrade(p.key)}
            >
              {current?.planKey === p.key ? "Current Plan" : upgrading === p.key ? "Processing..." : "Choose Plan"}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-semibold text-slate-900">Billing History</h2>
        <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {invoices.length === 0 && <p className="p-4 text-sm text-slate-400">No invoices yet.</p>}
          {invoices.map((inv) => (
            <div key={inv._id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>{inv.invoiceNumber}</span>
              <span className="text-slate-500">{new Date(inv.issuedAt).toLocaleDateString()}</span>
              <span className="font-medium">₹{inv.totalAmount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
