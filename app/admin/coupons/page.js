"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Ticket, Plus, Trash2 } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", description: "", discountType: "percent", discountValue: 10, maxUses: "" });

  const load = () => {
    fetch("/api/admin/coupons").then((r) => r.json()).then((d) => setCoupons(d.coupons || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, maxUses: form.maxUses ? Number(form.maxUses) : undefined, discountValue: Number(form.discountValue) }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Coupon created");
      setForm({ code: "", description: "", discountType: "percent", discountValue: 10, maxUses: "" });
      setShowForm(false);
      load();
    } else toast.error(data.message);
  };

  const remove = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Coupons</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> Add Coupon</Button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE e.g. WELCOME50" className="rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase" />
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="percent">Percent off</option>
            <option value="flat">Flat amount off (₹)</option>
          </select>
          <input required type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder="Discount value" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Max uses (optional)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <Button type="submit" size="sm" className="sm:col-span-2">Save Coupon</Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : coupons.length === 0 ? (
        <EmptyState icon={Ticket} title="No coupons yet" />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {coupons.map((c) => (
            <div key={c._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-mono text-sm font-semibold text-slate-900">{c.code}</p>
                <p className="text-xs text-slate-500">
                  {c.discountType === "percent" ? `${c.discountValue}% off` : `₹${c.discountValue} off`} · used {c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={c.status === "active" ? "verified" : "neutral"}>{c.status}</Badge>
                <button onClick={() => remove(c._id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
