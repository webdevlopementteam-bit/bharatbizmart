import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db/connect";
import Service from "@/models/Service";
import SupplierContactActions from "@/components/marketplace/SupplierContactActions";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const service = await Service.findOne({ slug }).populate("vendor", "businessName").lean();
  if (!service) return {};
  return {
    title: service.seo?.title || service.name,
    description: service.seo?.description || service.description?.slice(0, 155),
  };
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  await connectDB();

  const service = await Service.findOne({ slug, status: "active" }).populate("vendor").lean();
  if (!service) notFound();

  const data = JSON.parse(JSON.stringify(service));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {data.images?.[0] && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
          <Image src={data.images[0]} alt={data.name} fill className="object-cover" />
        </div>
      )}
      <h1 className="mt-6 text-2xl font-bold text-slate-900">{data.name}</h1>
      <Link href={`/suppliers/${data.vendor?.slug}`} className="text-sm text-brand hover:underline">{data.vendor?.businessName}</Link>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">{data.description}</p>
      {data.features?.length > 0 && (
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-600">
          {data.features.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      )}
      <div className="mt-6">
        <SupplierContactActions vendor={data.vendor} />
      </div>
    </div>
  );
}
