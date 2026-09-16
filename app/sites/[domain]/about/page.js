import { notFound } from "next/navigation";
import { getSiteContext } from "@/lib/tenant/getSiteContext";
import { VerificationBadge } from "@/components/ui/Badge";

export default async function VendorAboutPage({ params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  if (!site) notFound();
  const vendor = JSON.parse(JSON.stringify(site.vendor));
  const website = JSON.parse(JSON.stringify(site.website));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">About {vendor.businessName}</h1>
      {website.aboutContent && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">{website.aboutContent}</p>}
      {vendor.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">{vendor.description}</p>}

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {vendor.establishedYear && <Stat label="Established" value={vendor.establishedYear} />}
        <Stat label="Business Type" value={vendor.businessType?.replace("_", " ")} />
        {vendor.city && <Stat label="Location" value={`${vendor.city}, ${vendor.state}`} />}
        {vendor.branches?.length > 0 && <Stat label="Branches" value={vendor.branches.length} />}
      </div>

      {vendor.verification?.badges?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-slate-900">Certifications &amp; Trust</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vendor.verification.badges.map((b) => <VerificationBadge key={b} badge={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card-premium rounded-2xl p-4 text-center capitalize">
      <p className="font-display text-lg font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
