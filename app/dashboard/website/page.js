"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { ExternalLink } from "lucide-react";
import { getVendorSiteUrl, getVendorSiteHost } from "@/lib/utils/vendorUrl";

const templates = ["modern", "corporate", "industrial", "manufacturing", "trading", "minimal", "premium"];

export default function WebsiteBuilderPage() {
  const [website, setWebsite] = useState(null);
  const [saving, setSaving] = useState(false);
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [instructions, setInstructions] = useState(null);

  const load = () => fetch("/api/vendor/website").then((r) => r.json()).then((d) => setWebsite(d.website));
  const loadDomains = () => fetch("/api/domains").then((r) => r.json()).then((d) => setDomains(d.domains || []));
  useEffect(() => { load(); loadDomains(); }, []);

  if (!website) return <p className="text-sm text-slate-400">Loading...</p>;

  const set = (field) => (value) => setWebsite((w) => ({ ...w, [field]: value }));
  const setTheme = (field) => (value) => setWebsite((w) => ({ ...w, theme: { ...w.theme, [field]: value } }));

  const save = async (publish) => {
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/website", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...website, publish }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setWebsite(data.website);
      toast.success(publish ? "Website published!" : "Saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addDomain = async () => {
    if (!newDomain) return;
    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostname: newDomain }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Domain added — follow the DNS instructions below");
      setInstructions(data.instructions);
      setNewDomain("");
      loadDomains();
    } else toast.error(data.message);
  };

  const verifyDomain = async (id) => {
    const res = await fetch(`/api/domains/${id}/verify`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      toast[data.verified ? "success" : "error"](data.verified ? "Domain verified!" : "DNS not verified yet");
      loadDomains();
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Website Builder</h1>
        <a
          href={getVendorSiteUrl(website.subdomain)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          {getVendorSiteHost(website.subdomain)} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Template</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t}
              onClick={() => set("template")(t)}
              className={`rounded-lg border px-3 py-2 text-sm capitalize ${website.template === t ? "border-brand bg-brand/5 text-brand" : "border-slate-200 text-slate-600"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Theme</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ColorField label="Primary Color" value={website.theme?.primaryColor} onChange={setTheme("primaryColor")} />
          <ColorField label="Secondary Color" value={website.theme?.secondaryColor} onChange={setTheme("secondaryColor")} />
          <div>
            <label className="text-xs font-medium text-slate-600">Product Layout</label>
            <select value={website.theme?.productLayout} onChange={(e) => setTheme("productLayout")(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm">
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Hero Style</label>
            <select value={website.theme?.heroStyle} onChange={(e) => setTheme("heroStyle")(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm">
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Content</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Tagline</label>
            <input value={website.tagline || ""} onChange={(e) => set("tagline")(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">About Content</label>
            <textarea rows={4} value={website.aboutContent || ""} onChange={(e) => set("aboutContent")(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Custom Domain</h2>
        <p className="mt-1 text-xs text-slate-500">Connect your own domain (requires Premium plan or higher).</p>
        <div className="mt-3 flex gap-2">
          <input value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="www.yourbusiness.com" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <Button size="sm" onClick={addDomain}>Add Domain</Button>
        </div>
        {instructions && (
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            Add a <strong>{instructions.type}</strong> record: <strong>{instructions.host}</strong> → <strong>{instructions.value}</strong>
          </div>
        )}
        <div className="mt-3 space-y-2">
          {domains.map((d) => (
            <div key={d._id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span>{d.hostname}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs capitalize text-slate-500">{d.status.replace("_", " ")}</span>
                {d.status !== "verified" && (
                  <button onClick={() => verifyDomain(d._id)} className="text-xs font-medium text-brand hover:underline">Verify</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <Button onClick={() => save(false)} disabled={saving} variant="outline">Save Draft</Button>
        <Button onClick={() => save(true)} disabled={saving} variant="accent">Publish Website</Button>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input type="color" value={value || "#f97316"} onChange={(e) => onChange(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200" />
    </div>
  );
}
