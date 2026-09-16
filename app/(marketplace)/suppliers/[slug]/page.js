import { notFound } from "next/navigation";
import Image from "next/image";
import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { MapPin, Phone, Mail, Calendar } from "lucide-react";
import Rating from "@/components/ui/Rating";
import { VerificationBadge } from "@/components/ui/Badge";
import ProductCard from "@/components/marketplace/ProductCard";
import SupplierContactActions from "@/components/marketplace/SupplierContactActions";
import ReviewForm from "@/components/marketplace/ReviewForm";

// Note: with ISR, the profileViews increment below only fires when the page
// is actually re-rendered (roughly once per minute per vendor under load),
// not on every visit — an intentional, standard tradeoff for a counter under
// high traffic; it's a popularity signal, not a billing figure.
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const vendor = await Vendor.findOne({ slug, status: "approved" }).lean();
  if (!vendor) return {};
  return {
    title: vendor.seo?.title || `${vendor.businessName} - ${vendor.city}, ${vendor.state}`,
    description: vendor.seo?.description || vendor.description?.slice(0, 155) || `${vendor.businessName} is a ${vendor.businessType} based in ${vendor.city}.`,
    alternates: { canonical: `/suppliers/${vendor.slug}` },
  };
}

export default async function SupplierDetailPage({ params }) {
  const { slug } = await params;
  await connectDB();

  const vendor = await Vendor.findOne({ slug, status: "approved" }).populate("categories", "name slug").lean();
  if (!vendor) notFound();

  Vendor.updateOne({ _id: vendor._id }, { $inc: { "analytics.profileViews": 1 } }).catch(() => {});

  const [products, reviews] = await Promise.all([
    Product.find({ vendor: vendor._id, status: "active" }).limit(12).lean(),
    Review.find({ vendor: vendor._id, status: "approved" }).populate("buyer", "name").sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: vendor.businessName,
    description: vendor.description,
    image: vendor.logo,
    address: { "@type": "PostalAddress", addressLocality: vendor.city, addressRegion: vendor.state, addressCountry: vendor.country },
    aggregateRating: vendor.ratingCount ? { "@type": "AggregateRating", ratingValue: vendor.ratingAverage, reviewCount: vendor.ratingCount } : undefined,
  };

  const data = JSON.parse(JSON.stringify({ vendor, products, reviews }));

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative h-48 w-full bg-slate-200 sm:h-64">
        {data.vendor.coverImage && <Image src={data.vendor.coverImage} alt="" fill className="object-cover" />}
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-4 border-white bg-white shadow">
            {data.vendor.logo && <Image src={data.vendor.logo} alt={data.vendor.businessName} fill className="object-cover" />}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{data.vendor.businessName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <Rating value={data.vendor.ratingAverage} count={data.vendor.ratingCount} />
              {data.vendor.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{data.vendor.city}, {data.vendor.state}</span>}
              {data.vendor.establishedYear && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Since {data.vendor.establishedYear}</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {data.vendor.verification?.badges?.map((b) => <VerificationBadge key={b} badge={b} />)}
            </div>
          </div>
          <SupplierContactActions vendor={data.vendor} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            {data.vendor.description && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900">About</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{data.vendor.description}</p>
              </section>
            )}

            <section className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Products</h2>
              {data.products.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">No products listed yet.</p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {data.products.map((p) => <ProductCard key={p._id} product={{ ...p, vendor: data.vendor }} />)}
                </div>
              )}
            </section>

            <section className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Reviews ({data.reviews.length})</h2>
              </div>
              <div className="mt-4 space-y-4">
                {data.reviews.map((r) => (
                  <div key={r._id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">{r.buyer?.name}</p>
                      <Rating value={r.rating} showCount={false} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
                    {r.vendorReply?.text && (
                      <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600"><strong>Seller reply:</strong> {r.vendorReply.text}</p>
                    )}
                  </div>
                ))}
                {data.reviews.length === 0 && <p className="text-sm text-slate-400">No reviews yet.</p>}
              </div>
              <ReviewForm vendorId={data.vendor._id} />
            </section>
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {data.vendor.address && <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />{data.vendor.address}, {data.vendor.city}, {data.vendor.state} {data.vendor.pincode}</p>}
                {data.vendor.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />{data.vendor.phone}</p>}
                {data.vendor.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" />{data.vendor.email}</p>}
              </div>
            </div>
            {data.vendor.categories?.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Categories</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {data.vendor.categories.map((c) => (
                    <span key={c._id} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{c.name}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
