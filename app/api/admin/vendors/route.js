import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, getPagination, buildMeta } from "@/lib/utils/api";

export async function GET(request) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);

    await connectDB();
    const query = {};
    if (searchParams.get("status")) query.status = searchParams.get("status");
    const q = searchParams.get("q");
    if (q) query.$text = { $search: q };

    const [vendors, total] = await Promise.all([
      Vendor.find(query).populate("owner", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Vendor.countDocuments(query),
    ]);

    return ok({ vendors, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}
