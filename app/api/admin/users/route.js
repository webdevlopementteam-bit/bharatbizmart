import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, getPagination, buildMeta } from "@/lib/utils/api";

export async function GET(request) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);

    await connectDB();
    const query = {};
    if (searchParams.get("role")) query.role = searchParams.get("role");
    const q = searchParams.get("q");
    if (q) query.$text = { $search: q };

    const [users, total] = await Promise.all([
      User.find(query).select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return ok({ users, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}
