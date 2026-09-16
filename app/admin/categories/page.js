"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Trash2, Plus } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", parent: "", icon: "Boxes" });

  const load = () => {
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => setCategories(d.categories || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, parent: form.parent || null }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Category created");
      setForm({ name: "", parent: "", icon: "Boxes" });
      load();
    } else toast.error(data.message);
  };

  const remove = async (id) => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) load();
    else toast.error(data.message);
  };

  const rootCategories = categories.filter((c) => !c.parent);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Categories</h1>

      <form onSubmit={submit} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <label className="text-xs font-medium text-slate-600">Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Parent (optional)</label>
          <select value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">None (Root Category)</option>
            {rootCategories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <Button type="submit" size="sm"><Plus className="h-4 w-4" /> Add</Button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {categories.map((c) => (
            <div key={c._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{c.parent ? `— ${c.name}` : c.name}</p>
                <p className="text-xs text-slate-400">{c.parent?.name ? `Under ${c.parent.name}` : "Root category"}</p>
              </div>
              <button onClick={() => remove(c._id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
