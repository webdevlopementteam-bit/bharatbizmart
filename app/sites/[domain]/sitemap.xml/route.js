import { getSiteContext } from "@/lib/tenant/getSiteContext";
import { getVendorSiteUrl } from "@/lib/utils/vendorUrl";
import Product from "@/models/Product";

// Per-vendor dynamic sitemap, served at <subdomain>.<root>/sitemap.xml (spec section 23).
export async function GET(request, { params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  if (!site) return new Response("Not found", { status: 404 });

  const base = getVendorSiteUrl(site.website.subdomain);
  const staticPaths = ["", "/about", "/products", "/services", "/gallery", "/certifications", "/reviews", "/contact"];

  const products = await Product.find({ vendor: site.vendor._id, status: "active" }).select("slug updatedAt").lean();

  const urls = [
    ...staticPaths.map((p) => `<url><loc>${base}${p}</loc></url>`),
    ...products.map((p) => `<url><loc>${base}/products/${p.slug}</loc><lastmod>${new Date(p.updatedAt).toISOString()}</lastmod></url>`),
  ].join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
