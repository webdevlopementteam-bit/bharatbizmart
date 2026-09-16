import { connectDB } from "@/lib/db/connect";
import Advertisement from "@/models/Advertisement";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, fail, getPagination, buildMeta } from "@/lib/utils/api";

export async function GET(request) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);

    await connectDB();
    const query = {};
    if (searchParams.get("status")) query.status = searchParams.get("status");

    const [ads, total] = await Promise.all([
      Advertisement.find(query).populate("vendor", "businessName slug").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Advertisement.countDocuments(query),
    ]);

    return ok({ ads, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}

// Admin-created placements (homepage/category banners as sponsored slots) — separate
// from the vendor self-serve "Promote" purchase flow in /api/vendor/advertisements.
export async function POST(request) {
  try {
    await requireUser(["admin", "superadmin"]);
    const body = await request.json();
    if (!body?.type) return fail("Advertisement type is required");

    await connectDB();
    const ad = await Advertisement.create({ ...body, status: body.status || "active" });
    return ok({ ad }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
