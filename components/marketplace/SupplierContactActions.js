"use client";

import { useState } from "react";
import { Phone, MessageCircle, Heart, FileDown } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import EnquiryModal from "./EnquiryModal";
import { useAuth } from "@/components/AuthProvider";

export default function SupplierContactActions({ vendor }) {
  const [modal, setModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();

  const save = async () => {
    if (!user) return toast.error("Please login to save suppliers");
    const res = await fetch("/api/save/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId: vendor._id }),
    });
    const data = await res.json();
    if (data.success) {
      setSaved(true);
      toast.success("Saved to your list");
    }
  };

  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      <Button variant="accent" onClick={() => setModal(true)}>Contact Supplier</Button>
      {vendor.phone && <Button as="a" href={`tel:${vendor.phone}`} variant="outline"><Phone className="h-4 w-4" /></Button>}
      {vendor.whatsapp && (
        <Button as="a" href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, "")}`} target="_blank" variant="outline" className="!bg-emerald-50 !text-emerald-700">
          <MessageCircle className="h-4 w-4" />
        </Button>
      )}
      <Button variant="outline" onClick={save}><Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} /></Button>
      <Button as="a" href={`/api/vendors/${vendor.slug}/catalog`} target="_blank" variant="outline">
        <FileDown className="h-4 w-4" /> Catalog PDF
      </Button>
      <EnquiryModal open={modal} onClose={() => setModal(false)} vendorId={vendor._id} title="Contact Supplier" />
    </div>
  );
}
