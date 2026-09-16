"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";

export default function EnquiryModal({ open, onClose, vendorId, productId, title = "Send Enquiry", presetRequirement }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    mobile: user?.phone || "",
    email: user?.email || "",
    quantity: "",
    requirement: presetRequirement || "",
    deliveryLocation: "",
    message: "",
  });

  if (!open) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile) {
      toast.error("Name and mobile number are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, productId, ...form, source: "product_page" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to send enquiry");
      toast.success("Enquiry sent! The supplier will contact you shortly.");
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">Fill in your requirement, the supplier will get back to you.</p>

        <div className="mt-5 space-y-3">
          <Input label="Your Name *" value={form.name} onChange={update("name")} />
          <Input label="Mobile Number *" value={form.mobile} onChange={update("mobile")} />
          <Input label="Email" value={form.email} onChange={update("email")} type="email" />
          <Input label="Quantity Required" value={form.quantity} onChange={update("quantity")} />
          <Input label="Delivery Location" value={form.deliveryLocation} onChange={update("deliveryLocation")} />
          <div>
            <label className="text-xs font-medium text-slate-600">Requirement / Message</label>
            <textarea
              value={form.requirement}
              onChange={update("requirement")}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="mt-5 w-full">
          {submitting ? "Sending..." : "Send Enquiry"}
        </Button>
      </form>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}
