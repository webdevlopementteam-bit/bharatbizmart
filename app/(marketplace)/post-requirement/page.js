"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";

export default function PostRequirementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "", category: "", quantity: "", specifications: "", budget: "", deliveryLocation: "", requiredByDate: "", description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/categories?parent=root").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login as a buyer to post a requirement");
      router.push("/login?next=/post-requirement");
      return;
    }
    if (!form.title) return toast.error("Please describe what you're looking for");

    setSubmitting(true);
    try {
      const res = await fetch("/api/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success("Requirement posted! Suppliers will start sending quotations.");
      router.push(`/rfq/${data.rfq._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Post a Buying Requirement</h1>
      <p className="mt-1 text-sm text-slate-500">Tell us what you need, and matching suppliers will send you quotations.</p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <Field label="What are you looking for? *" value={form.title} onChange={set("title")} placeholder="e.g. 500 Industrial Hydraulic Pumps" />
        <div>
          <label className="text-xs font-medium text-slate-600">Category</label>
          <select value={form.category} onChange={set("category")} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Quantity" value={form.quantity} onChange={set("quantity")} />
          <Field label="Budget" value={form.budget} onChange={set("budget")} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Delivery Location" value={form.deliveryLocation} onChange={set("deliveryLocation")} />
          <Field label="Required By" type="date" value={form.requiredByDate} onChange={set("requiredByDate")} />
        </div>
        <Field label="Specifications" value={form.specifications} onChange={set("specifications")} />
        <div>
          <label className="text-xs font-medium text-slate-600">Description</label>
          <textarea value={form.description} onChange={set("description")} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">{submitting ? "Posting..." : "Post Requirement"}</Button>
      </form>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
    </div>
  );
}
