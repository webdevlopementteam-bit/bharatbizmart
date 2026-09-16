import { connectDB } from "@/lib/db/connect";
import Quotation from "@/models/Quotation";
import Vendor from "@/models/Vendor";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { generateQuotationPdf } from "@/lib/pdf/generateQuotationPdf";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "BharatBizMart";

export async function GET(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    await connectDB();
    const filter = user.role === "vendor" ? { _id: id, vendor: user.vendor } : { _id: id, buyer: user._id };
    const quotation = await Quotation.findOne(filter).lean();
    if (!quotation) throw new ApiError(404, "Quotation not found");

    const vendor = await Vendor.findById(quotation.vendor).lean();
    const bytes = await generateQuotationPdf(quotation, vendor, APP_NAME);

    return new Response(bytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="quotation-${id}.pdf"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
