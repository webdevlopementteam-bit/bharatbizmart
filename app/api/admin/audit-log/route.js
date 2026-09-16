import { connectDB } from "@/lib/db/connect";
import AuditLog from "@/models/AuditLog";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, getPagination, buildMeta } from "@/lib/utils/api";

// Superadmin-only: a read-only trail of every moderation action taken across
// the platform (vendor approvals, user suspensions, role changes) — the
// accountability layer a "super" admin needs over regular admin staff.
export async function GET(request) {
  try {
    await requireUser(["superadmin"]);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);

    await connectDB();
    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate("actor", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(),
    ]);

    return ok({ logs, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}
