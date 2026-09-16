"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle, MessagesSquare, Tag, FileText } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import EnquiryModal from "./EnquiryModal";
import { useAuth } from "@/components/AuthProvider";

export default function ProductActions({ product, vendor }) {
  const [modal, setModal] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  const startChat = async () => {
    if (!user) {
      toast.error("Please login to chat with the supplier");
      router.push(`/login?next=/products/${product.slug}`);
      return;
    }
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: vendor._id, productId: product._id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not start chat");
      router.push(`/account/messages/${data.conversation._id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Button variant="accent" onClick={() => setModal("price")}>
          <Tag className="h-4 w-4" /> Get Best Price
        </Button>
        <Button variant="primary" onClick={() => setModal("enquiry")}>
          Send Enquiry
        </Button>
        <Button variant="outline" onClick={() => setModal("quote")}>
          <FileText className="h-4 w-4" /> Request Quote
        </Button>
        {vendor.phone && (
          <Button as="a" href={`tel:${vendor.phone}`} variant="outline">
            <Phone className="h-4 w-4" /> Call
          </Button>
        )}
        {vendor.whatsapp && (
          <Button
            as="a"
            href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name}`)}`}
            target="_blank"
            variant="outline"
            className="!bg-emerald-50 !text-emerald-700 hover:!bg-emerald-100"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
        )}
        <Button variant="outline" onClick={startChat}>
          <MessagesSquare className="h-4 w-4" /> Chat
        </Button>
      </div>

      <EnquiryModal
        open={!!modal}
        onClose={() => setModal(null)}
        vendorId={vendor._id}
        productId={product._id}
        title={modal === "price" ? "Get Best Price" : modal === "quote" ? "Request a Quote" : "Send Enquiry"}
        presetRequirement={modal === "quote" ? `Requesting a formal quotation for ${product.name}` : ""}
      />
    </>
  );
}
