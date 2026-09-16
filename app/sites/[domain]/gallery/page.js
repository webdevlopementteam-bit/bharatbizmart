import { notFound } from "next/navigation";
import Image from "next/image";
import { getSiteContext } from "@/lib/tenant/getSiteContext";
import EmptyState from "@/components/ui/EmptyState";
import { ImageIcon } from "lucide-react";

export default async function VendorGalleryPage({ params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  if (!site) notFound();

  const images = [site.vendor.coverImage, ...(site.vendor.gallery || [])].filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Gallery</h1>
      {images.length === 0 ? (
        <div className="mt-6"><EmptyState icon={ImageIcon} title="No images added yet" /></div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
              <Image src={img} alt={`Gallery ${i + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
