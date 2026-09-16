import { connectDB } from "@/lib/db/connect";
import Service from "@/models/Service";
import Link from "next/link";
import Image from "next/image";
import { Wrench } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = {
  title: "Browse Services",
  description: "Find service providers for your business needs.",
};

export default async function ServicesPage({ searchParams }) {
  const sp = await searchParams;
  await connectDB();

  const query = { status: "active" };
  if (sp.q) query.$text = { $search: sp.q };

  const services = await Service.find(query).populate("vendor", "businessName slug city").limit(48).lean();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Services</h1>
      {services.length === 0 ? (
        <EmptyState icon={Wrench} title="No services listed yet" />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link key={s._id} href={`/services/${s.slug}`} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {s.images?.[0] && <Image src={s.images[0]} alt={s.name} fill className="object-cover" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{s.name}</h3>
                <p className="line-clamp-2 text-xs text-slate-500">{s.description}</p>
                <p className="mt-1 text-xs text-slate-400">{s.vendor?.businessName}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
