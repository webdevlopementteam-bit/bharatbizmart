"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MessageCircleQuestion } from "lucide-react";

const faqs = [
  {
    q: "How do I find verified suppliers on BharatBizMart?",
    a: "Use the search bar or browse by category, then filter results by \"Verified Suppliers Only\". Every verified business has passed GST and business document checks by our team.",
  },
  {
    q: "Is it free to register as a buyer or seller?",
    a: "Yes. Buyer accounts are always free. Sellers get a free plan with a basic profile, limited products and an auto-generated business website — with paid plans available for more products, leads and premium features.",
  },
  {
    q: "How does the RFQ (buying requirement) process work?",
    a: "Post your requirement with quantity, budget and delivery location. Matching verified suppliers in that category are notified automatically and can send you formal quotations to compare.",
  },
  {
    q: "What do I get with my seller website?",
    a: "Every approved seller automatically gets a live business website on its own subdomain (yourbusiness.bharatbizmart.com), showing your products, services, certifications and reviews — no setup needed.",
  },
  {
    q: "How long does business verification take?",
    a: "Once you submit your GST/PAN/registration documents from your dashboard, our team typically reviews them within 2-3 business days.",
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState(0);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24 lg:self-start">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <MessageCircleQuestion className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">Still have a question?</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Can&apos;t find what you&apos;re looking for in the list? Our support team typically replies within a few hours.
        </p>
        <Link
          href="/pages/contact"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          Contact Support
        </Link>
      </div>

      <div className="space-y-3">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className={`overflow-hidden rounded-2xl border bg-white transition-colors ${isOpen ? "border-brand/30 shadow-sm" : "border-slate-200"}`}
            >
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isOpen ? "bg-brand text-white" : "bg-slate-100 text-slate-500"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm font-semibold text-slate-900">{item.q}</span>
                <Plus className={`h-4 w-4 shrink-0 text-brand transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 pl-16 text-sm leading-relaxed text-slate-500">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
