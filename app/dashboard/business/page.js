"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import FileUpload from "@/components/dashboard/FileUpload";
import { VerificationBadge } from "@/components/ui/Badge";

export default function BusinessProfilePage() {
  const [vendor, setVendor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [docType, setDocType] = useState("gst");
  const [docUrl, setDocUrl] = useState("");
  const [submittingDoc, setSubmittingDoc] = useState(false);

  const load = () => {
    fetch("/api/vendor/me").then((r) => r.json()).then((d) => setVendor(d.vendor));
  };
  useEffect(load, []);

  if (!vendor) return <p className="text-sm text-slate-400">Loading...</p>;

  const set = (field) => (value) => setVendor((v) => ({ ...v, [field]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendor),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const submitVerification = async () => {
    if (!docUrl) return toast.error("Upload a document first");
    setSubmittingDoc(true);
    try {
      const res = await fetch("/api/vendor/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documents: [{ type: docType, fileUrl: docUrl }] }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success("Submitted for verification");
      setDocUrl("");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingDoc(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">My Business</h1>
          <span className="text-xs font-medium capitalize text-slate-500">Status: {vendor.status.replace("_", " ")}</span>
        </div>
        {vendor.verification?.badges?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {vendor.verification.badges.map((b) => <VerificationBadge key={b} badge={b} />)}
          </div>
        )}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Branding</h2>
        <div className="mt-4 grid grid-cols-2 gap-6">
          <FileUpload label="Logo" value={vendor.logo} onChange={set("logo")} folder="logos" />
          <FileUpload label="Cover Image" value={vendor.coverImage} onChange={set("coverImage")} folder="covers" />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Business Details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Business Name" value={vendor.businessName} onChange={set("businessName")} />
          <Field label="Tagline" value={vendor.tagline} onChange={set("tagline")} />
          <Field label="Phone" value={vendor.phone} onChange={set("phone")} />
          <Field label="WhatsApp Number" value={vendor.whatsapp} onChange={set("whatsapp")} />
          <Field label="City" value={vendor.city} onChange={set("city")} />
          <Field label="State" value={vendor.state} onChange={set("state")} />
          <Field label="Address" value={vendor.address} onChange={set("address")} className="sm:col-span-2" />
        </div>
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">Description</label>
          <textarea
            rows={4}
            value={vendor.description || ""}
            onChange={(e) => set("description")(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <Button onClick={save} disabled={saving} className="mt-4">{saving ? "Saving..." : "Save Changes"}</Button>
      </section>

      {vendor.verification?.status !== "verified" && (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Get Verified</h2>
          <p className="mt-1 text-xs text-slate-500">Upload GST, PAN or business registration documents for admin review.</p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="gst">GST Certificate</option>
                <option value="pan">PAN Card</option>
                <option value="registration">Business Registration</option>
              </select>
            </div>
            <FileUpload label="Document" value={docUrl} onChange={setDocUrl} folder="documents" accept="image/*,application/pdf" />
            <Button onClick={submitVerification} disabled={submittingDoc}>{submittingDoc ? "Submitting..." : "Submit for Verification"}</Button>
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, value, onChange, className }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  );
}
