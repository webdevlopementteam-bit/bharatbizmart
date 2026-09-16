"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { MapPin, Trash2, Plus } from "lucide-react";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "Office", line1: "", city: "", state: "", pincode: "" });

  const load = () => {
    fetch("/api/account/addresses").then((r) => r.json()).then((d) => setAddresses(d.addresses || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Address added");
      setAddresses(data.addresses);
      setShowForm(false);
      setForm({ label: "Office", line1: "", city: "", state: "", pincode: "" });
    } else toast.error(data.message);
  };

  const remove = async (id) => {
    await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
    setAddresses((a) => a.filter((x) => x._id !== id));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Addresses</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> Add Address</Button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label (Home/Office)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Address Line" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} placeholder="Pincode" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <Button type="submit" className="sm:col-span-2">Save Address</Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No addresses saved" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a._id} className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{a.label}</p>
                <p className="text-sm text-slate-500">{a.line1}, {a.city}, {a.state} {a.pincode}</p>
              </div>
              <button onClick={() => remove(a._id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
