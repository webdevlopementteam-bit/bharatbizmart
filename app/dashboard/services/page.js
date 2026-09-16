"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Wrench, Plus, Trash2 } from "lucide-react";

export default function VendorServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const load = () => {
    fetch("/api/vendor/services").then((r) => r.json()).then((d) => setServices(d.services || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/vendor/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Service added");
      setServices((s) => [data.service, ...s]);
      setForm({ name: "", description: "" });
      setShowForm(false);
    } else toast.error(data.message);
  };

  const remove = async (id) => {
    if (!confirm("Delete this service?")) return;
    const res = await fetch(`/api/vendor/services/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) setServices((s) => s.filter((x) => x._id !== id));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Services</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> Add Service</Button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Service name" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <Button type="submit" size="sm">Save Service</Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : services.length === 0 ? (
        <EmptyState icon={Wrench} title="No services yet" />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {services.map((s) => (
            <div key={s._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{s.name}</p>
                <p className="line-clamp-1 text-xs text-slate-500">{s.description}</p>
              </div>
              <button onClick={() => remove(s._id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
