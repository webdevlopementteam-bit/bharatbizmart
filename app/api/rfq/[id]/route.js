import { connectDB } from "@/lib/db/connect";
import RFQ from "@/models/RFQ";
import { ok, fail } from "@/lib/utils/api";

export async function GET(request, { params }) {
  const { id } = await params;
  await connectDB();

  const rfq = await RFQ.findById(id)
    .populate("buyer", "name")
    .populate("category", "name slug")
    .populate({ path: "quotations", populate: { path: "vendor", select: "businessName slug logo verification" } })
    .lean();
  if (!rfq) return fail("Requirement not found", 404);

  return ok({ rfq });
}
