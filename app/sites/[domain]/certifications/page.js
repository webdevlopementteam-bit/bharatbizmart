import { notFound } from "next/navigation";
import { getSiteContext } from "@/lib/tenant/getSiteContext";
import { VerificationBadge } from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Award } from "lucide-react";

export default async function VendorCertificationsPage({ params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  if (!site) notFound();

  const vendor = JSON.parse(JSON.stringify(site.vendor));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Certifications</h1>

      {vendor.verification?.badges?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {vendor.verification.badges.map((b) => <VerificationBadge key={b} badge={b} />)}
        </div>
      )}

      {vendor.certifications?.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {vendor.certifications.map((c) => (
            <div key={c._id} className="card-premium rounded-2xl p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "color-mix(in srgb, var(--site-primary) 12%, white)", color: "var(--site-primary)" }}>
                <Award className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{c.title}</h3>
              <p className="text-xs text-slate-500">{c.issuedBy} {c.issuedYear ? `· ${c.issuedYear}` : ""}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6"><EmptyState icon={Award} title="No certifications uploaded yet" /></div>
      )}
    </div>
  );
}
