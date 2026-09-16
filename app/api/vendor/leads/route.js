import { connectDB } from "@/lib/db/connect";
import Lead from "@/models/Lead";
import { requireUser, requireVendorContext, handleApiError } from "@/lib/auth/guard";
import { ok, fail, getPagination, buildMeta } from "@/lib/utils/api";
import { annotateLeadsWithPlanLimit } from "@/lib/utils/leadAccess";

export async function GET(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);

    await connectDB();
    const query = { vendor: vendor._id };
    if (searchParams.get("status")) query.status = searchParams.get("status");

    const [rawLeads, total] = await Promise.all([
      Lead.find(query).populate("product", "name slug").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(query),
    ]);

    const { leads, usage } = await annotateLeadsWithPlanLimit(vendor, rawLeads);

    return ok({ leads, usage, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const body = await request.json();
    if (!body?.buyerName) return fail("Buyer name is required");

    await connectDB();
    const lead = await Lead.create({ ...body, vendor: vendor._id, source: "manual" });
    return ok({ lead }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
