import { notFound } from "next/navigation";
import { getSiteContext } from "@/lib/tenant/getSiteContext";
import VendorSiteHeader from "@/components/vendor-site/VendorSiteHeader";
import VendorSiteFooter from "@/components/vendor-site/VendorSiteFooter";
import { connectDB } from "@/lib/db/connect";
import Website from "@/models/Website";

export default async function VendorSiteLayout({ children, params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  if (!site) notFound();

  // Track a lightweight visitor counter for the vendor's website analytics.
  Website.updateOne({ _id: site.website._id }, { $inc: { visitorCount: 1 } })
    .exec()
    .catch(() => {});
  connectDB().catch(() => {});

  const data = JSON.parse(JSON.stringify(site));

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ "--site-primary": data.website.theme?.primaryColor || "#f97316", "--site-secondary": data.website.theme?.secondaryColor || "#15803d" }}
    >
      <VendorSiteHeader vendor={data.vendor} website={data.website} />
      <main className="flex-1">{children}</main>
      <VendorSiteFooter vendor={data.vendor} website={data.website} />
    </div>
  );
}
