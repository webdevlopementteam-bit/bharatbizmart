import { connectDB } from "@/lib/db/connect";
import Enquiry from "@/models/Enquiry";
import { requireUser, requireVendorContext, handleApiError } from "@/lib/auth/guard";
import { ok, getPagination, buildMeta } from "@/lib/utils/api";
import { annotateEnquiriesWithPlanLimit } from "@/lib/utils/leadAccess";

export async function GET(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);

    await connectDB();
    const query = { vendor: vendor._id };
    if (searchParams.get("status")) query.status = searchParams.get("status");

    const [rawEnquiries, total] = await Promise.all([
      Enquiry.find(query).populate("product", "name slug").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Enquiry.countDocuments(query),
    ]);

    const { enquiries, usage } = await annotateEnquiriesWithPlanLimit(vendor, rawEnquiries);

    return ok({ enquiries, usage, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}
