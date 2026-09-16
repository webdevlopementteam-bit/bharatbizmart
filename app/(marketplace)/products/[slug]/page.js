import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import { MapPin, ShieldCheck } from "lucide-react";
import Rating from "@/components/ui/Rating";
import { VerificationBadge } from "@/components/ui/Badge";
import ProductGallery from "@/components/marketplace/ProductGallery";
import ProductActions from "@/components/marketplace/ProductActions";
import ProductCard from "@/components/marketplace/ProductCard";

// ISR: the same product page is served from cache for up to a minute
// instead of hitting MongoDB on every single view — essential once traffic
// is more than a single server can query for directly.
export const revalidate = 60;

async function getProduct(slug) {
  await connectDB();
  const product = await Product.findOne({ slug, status: "active" }).populate("vendor").populate("category", "name slug").lean();
  if (!product) return null;

  const similarProducts = await Product.find({
    category: product.category?._id,
    status: "active",
    _id: { $ne: product._id },
  })
    .limit(8)
    .select("name slug images price moq vendor")
    .populate("vendor", "businessName slug city")
    .lean();

  return JSON.parse(JSON.stringify({ product, similarProducts }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const product = await Product.findOne({ slug, status: "active" }).populate("vendor", "businessName city state").lean();
  if (!product) return {};

  const title = product.seo?.title || `${product.name} - Best Price from ${product.vendor?.businessName}`;
  const description = product.seo?.description || product.description?.slice(0, 155) || `Buy ${product.name} at best price. MOQ ${product.moq} ${product.moqUnit}.`;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title, description, images: product.images?.[0] ? [product.images[0]] : [] },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();
  const { product, similarProducts } = data;
  const vendor = product.vendor || {};

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price?.min || 0,
      availability: product.availability === "in_stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: vendor.businessName },
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand">Home</Link> /{" "}
        <Link href="/products" className="hover:text-brand">Products</Link> /{" "}
        {product.category && (
          <>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-brand">{product.category.name}</Link> /{" "}
          </>
        )}
        <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
        <ProductGallery images={product.images || []} name={product.name} />

        <div>
          <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand">
              {product.price?.min ? `₹${product.price.min.toLocaleString("en-IN")}${product.price.max && product.price.max !== product.price.min ? ` - ₹${product.price.max.toLocaleString("en-IN")}` : ""}` : "Price on Request"}
            </span>
            <span className="text-sm text-slate-500">/ {product.price?.unit || "piece"}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">MOQ: {product.moq} {product.moqUnit}</p>

          {product.priceTiers?.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Order Quantity</th>
                    <th className="px-4 py-2 text-right font-semibold">Price/{product.price?.unit || product.moqUnit}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.priceTiers
                    .slice()
                    .sort((a, b) => a.minQty - b.minQty)
                    .map((t, i) => (
                      <tr key={i} className="odd:bg-white even:bg-slate-50/50">
                        <td className="px-4 py-2 text-slate-700">
                          {t.maxQty ? `${t.minQty} - ${t.maxQty} ${product.moqUnit}` : `${t.minQty}+ ${product.moqUnit}`}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-slate-900">₹{t.price.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                {vendor.logo && <Image src={vendor.logo} alt={vendor.businessName} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <Link href={`/suppliers/${vendor.slug}`} className="font-semibold text-slate-900 hover:text-brand">{vendor.businessName}</Link>
                <Rating value={vendor.ratingAverage} count={vendor.ratingCount} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
              {(vendor.city || vendor.state) && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{vendor.city}, {vendor.state}</span>
              )}
              {vendor.establishedYear && <span>Since {vendor.establishedYear}</span>}
            </div>
            {vendor.verification?.badges?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {vendor.verification.badges.map((b) => <VerificationBadge key={b} badge={b} />)}
              </div>
            )}
          </div>

          <ProductActions product={product} vendor={vendor} />

          {product.specifications?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Specifications</h2>
              <dl className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                {product.specifications.map((s, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4 px-4 py-2.5 text-sm odd:bg-slate-50/50">
                    <dt className="text-slate-500">{s.key}</dt>
                    <dd className="text-slate-800">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.description && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{product.description}</p>
            </div>
          )}

          {product.features?.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Features</h2>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
                {product.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
            {product.packagingDetails && <InfoBlock title="Packaging" value={product.packagingDetails} />}
            {product.deliveryDetails && <InfoBlock title="Delivery" value={product.deliveryDetails} />}
            {product.paymentTerms && <InfoBlock title="Payment Terms" value={product.paymentTerms} />}
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-slate-900">Similar Products</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {similarProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoBlock({ title, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase text-slate-400">{title}</p>
      <p className="mt-1 text-slate-700">{value}</p>
    </div>
  );
}
