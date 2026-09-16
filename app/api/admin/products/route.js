import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
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

    const [products, total] = await Promise.all([
      Product.find(query).populate("vendor", "businessName slug").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return ok({ products, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}
