"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FileUpload from "@/components/dashboard/FileUpload";
import EmptyState from "@/components/ui/EmptyState";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", linkUrl: "", ctaLabel: "", placement: "homepage_hero" });

  const load = () => {
    fetch("/api/admin/banners").then((r) => r.json()).then((d) => setBanners(d.banners || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.image) return toast.error("Upload a banner image first");
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Banner created");
      setForm({ title: "", subtitle: "", image: "", linkUrl: "", ctaLabel: "", placement: "homepage_hero" });
      setShowForm(false);
      load();
    } else toast.error(data.message);
  };

  const toggleStatus = async (banner) => {
    const res = await fetch(`/api/admin/banners/${banner._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: banner.status === "active" ? "inactive" : "active" }),
    });
    const data = await res.json();
    if (data.success) load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Banners</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> Add Banner</Button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitle" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="Link URL (e.g. /register-business)" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} placeholder="CTA Label" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="homepage_hero">Homepage Hero</option>
            <option value="homepage_strip">Homepage Strip</option>
            <option value="category_top">Category Top</option>
            <option value="sidebar">Sidebar</option>
          </select>
          <FileUpload label="Banner Image" value={form.image} onChange={(url) => setForm({ ...form, image: url })} folder="bharatbizmart/banners" />
          <Button type="submit" size="sm" className="sm:col-span-2">Save Banner</Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : banners.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No banners yet" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <div key={b._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {b.image && (
                <div className="relative h-32 w-full">
                  <Image src={b.image} alt={b.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-semibold text-slate-900">{b.title}</p>
                <p className="text-xs text-slate-500">{b.placement.replace("_", " ")}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge tone={b.status === "active" ? "verified" : "neutral"}>{b.status}</Badge>
                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(b)} className="text-xs font-medium text-brand hover:underline">
                      {b.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => remove(b._id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
