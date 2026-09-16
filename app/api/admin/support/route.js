import { connectDB } from "@/lib/db/connect";
import SupportTicket from "@/models/SupportTicket";
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

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query).populate("user", "name email role").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SupportTicket.countDocuments(query),
    ]);

    return ok({ tickets, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}
