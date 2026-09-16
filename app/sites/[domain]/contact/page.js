import { notFound } from "next/navigation";
import { getSiteContext } from "@/lib/tenant/getSiteContext";
import ContactForm from "@/components/vendor-site/ContactForm";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

export default async function VendorContactPage({ params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  if (!site) notFound();

  const vendor = JSON.parse(JSON.stringify(site.vendor));
  const website = JSON.parse(JSON.stringify(site.website));
  const address = [vendor.address, vendor.city, vendor.state, vendor.pincode].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Contact Us</h1>
      <p className="mt-1 text-sm text-slate-500">We&apos;d love to hear from you — reach out any time.</p>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card-premium rounded-2xl p-5">
            <div className="space-y-3 text-sm text-slate-600">
              {address && <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--site-primary)" }} />{address}</p>}
              {vendor.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" style={{ color: "var(--site-primary)" }} /><a href={`tel:${vendor.phone}`} className="hover:underline">{vendor.phone}</a></p>}
              {vendor.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4" style={{ color: "var(--site-primary)" }} /><a href={`mailto:${vendor.email}`} className="hover:underline">{vendor.email}</a></p>}
              {vendor.whatsapp && website.contact?.showWhatsapp && (
                <p className="flex items-center gap-2"><MessageCircle className="h-4 w-4" style={{ color: "var(--site-primary)" }} /><a href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:underline">WhatsApp</a></p>
              )}
            </div>
          </div>
          {website.contact?.showMap !== false && address && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <iframe
                title="Location map"
                width="100%"
                height="260"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
              />
            </div>
          )}
        </div>
        {website.contact?.showContactForm !== false && <ContactForm vendorId={vendor._id} />}
      </div>
    </div>
  );
}
