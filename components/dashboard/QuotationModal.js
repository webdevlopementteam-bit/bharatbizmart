"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

export default function QuotationModal({ open, onClose, rfq, onSent }) {
  const [form, setForm] = useState({
    productName: rfq?.productName || "",
    quantity: "",
    unitPrice: "",
    discount: 0,
    gstPercent: 18,
    shippingCharge: 0,
    deliveryTime: "",
    paymentTerms: "",
    validTill: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rfq: rfq._id, buyer: rfq.buyer?._id || rfq.buyer }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success("Quotation sent");
      onSent?.(data.quotation);
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
      <form onSubmit={submit} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        <h2 className="text-lg font-bold text-slate-900">Send Quotation</h2>
        <p className="mt-1 text-sm text-slate-500">For: {rfq?.title}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Input label="Product Name" value={form.productName} onChange={update("productName")} className="col-span-2" />
          <Input label="Quantity *" type="number" value={form.quantity} onChange={update("quantity")} />
          <Input label="Unit Price (₹) *" type="number" value={form.unitPrice} onChange={update("unitPrice")} />
          <Input label="Discount (₹)" type="number" value={form.discount} onChange={update("discount")} />
          <Input label="GST %" type="number" value={form.gstPercent} onChange={update("gstPercent")} />
          <Input label="Shipping (₹)" type="number" value={form.shippingCharge} onChange={update("shippingCharge")} />
          <Input label="Delivery Time" value={form.deliveryTime} onChange={update("deliveryTime")} />
          <Input label="Payment Terms" value={form.paymentTerms} onChange={update("paymentTerms")} className="col-span-2" />
          <Input label="Valid Till" type="date" value={form.validTill} onChange={update("validTill")} className="col-span-2" />
        </div>

        <Button type="submit" disabled={submitting} className="mt-5 w-full">{submitting ? "Sending..." : "Send Quotation"}</Button>
      </form>
    </div>
  );
}

function Input({ label, className, ...props }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input {...props} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
    </div>
  );
}
