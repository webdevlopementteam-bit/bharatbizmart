import { notFound } from "next/navigation";
import Link from "next/link";
import { getSiteContext } from "@/lib/tenant/getSiteContext";
import Service from "@/models/Service";
import EmptyState from "@/components/ui/EmptyState";
import { Wrench, ArrowRight } from "lucide-react";

export default async function VendorServicesListPage({ params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  if (!site) notFound();
  // Product-based businesses don't carry a services catalog.
  if (site.vendor.businessType !== "service_provider") notFound();

  const services = await Service.find({ vendor: site.vendor._id, status: "active" }).lean();
  const data = JSON.parse(JSON.stringify(services));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-900">Our Services</h1>
      <p className="mt-1 text-sm text-slate-500">{data.length} service{data.length === 1 ? "" : "s"} offered by {site.vendor.businessName}</p>
      {data.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Wrench} title="No services listed yet" /></div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => (
            <div key={s._id} className="card-premium flex flex-col rounded-2xl p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "color-mix(in srgb, var(--site-primary) 12%, white)", color: "var(--site-primary)" }}>
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.description}</p>
              {s.features?.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
                  {s.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--site-primary)" }} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/contact" className="mt-5 flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--site-primary)" }}>
                Enquire Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
