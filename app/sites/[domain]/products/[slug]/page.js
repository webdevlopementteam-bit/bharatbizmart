import { notFound } from "next/navigation";
import { getSiteContext } from "@/lib/tenant/getSiteContext";
import Product from "@/models/Product";
import ProductGallery from "@/components/marketplace/ProductGallery";
import ProductActions from "@/components/marketplace/ProductActions";

export async function generateMetadata({ params }) {
  const { domain, slug } = await params;
  const site = await getSiteContext(domain);
  if (!site) return {};
  const product = await Product.findOne({ slug, vendor: site.vendor._id, status: "active" }).lean();
  if (!product) return {};
  return {
    title: product.seo?.title || `${product.name} - ${site.vendor.businessName}`,
    description: product.seo?.description || product.description?.slice(0, 155),
  };
}

export default async function VendorProductDetailPage({ params }) {
  const { domain, slug } = await params;
  const site = await getSiteContext(domain);
  if (!site) notFound();
  if (site.vendor.businessType === "service_provider") notFound();

  const product = await Product.findOne({ slug, vendor: site.vendor._id, status: "active" }).lean();
  if (!product) notFound();

  const data = JSON.parse(JSON.stringify({ product, vendor: site.vendor }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
        <ProductGallery images={data.product.images || []} name={data.product.name} />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{data.product.name}</h1>
          <p className="mt-2 text-2xl font-bold" style={{ color: "var(--site-primary)" }}>
            {data.product.price?.min ? `₹${data.product.price.min.toLocaleString("en-IN")}` : "Price on Request"}
          </p>
          <p className="text-sm text-slate-500">MOQ: {data.product.moq} {data.product.moqUnit}</p>
          <ProductActions product={data.product} vendor={data.vendor} />
          {data.product.description && <p className="mt-8 whitespace-pre-line text-sm leading-relaxed text-slate-600">{data.product.description}</p>}
        </div>
      </div>
    </div>
  );
}
