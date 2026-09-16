import { getSiteContext } from "@/lib/tenant/getSiteContext";
import { getVendorSiteUrl } from "@/lib/utils/vendorUrl";

export async function GET(request, { params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  const base = site ? getVendorSiteUrl(site.website.subdomain) : "";

  const body = `User-agent: *\nAllow: /\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ""}`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
