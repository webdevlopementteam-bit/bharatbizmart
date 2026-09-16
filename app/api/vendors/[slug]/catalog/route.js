import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import Product from "@/models/Product";
import { fail } from "@/lib/utils/api";
import { generateCatalogPdf } from "@/lib/pdf/generateCatalogPdf";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "BharatBizMart";

// Public — anyone viewing a supplier's profile can download their auto-generated catalog.
export async function GET(request, { params }) {
  const { slug } = await params;
  await connectDB();

  const vendor = await Vendor.findOne({ slug, status: "approved" }).lean();
  if (!vendor) return fail("Supplier not found", 404);

  const products = await Product.find({ vendor: vendor._id, status: "active" }).sort({ createdAt: -1 }).limit(100).lean();
  const bytes = await generateCatalogPdf(vendor, products, APP_NAME);

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slug}-catalog.pdf"`,
    },
  });
}
