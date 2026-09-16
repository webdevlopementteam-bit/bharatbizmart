import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

const ALLOWED_STATUS = ["active", "suspended", "banned"];
// Role escalation is superadmin-only, and never grants superadmin itself via
// the API — that stays a manual/seed-level action to prevent self-service
// creation of the platform's highest privilege.
const ALLOWED_ROLES = ["buyer", "vendor", "admin"];

export async function PUT(request, { params }) {
  try {
    const admin = await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    const { status, role } = await request.json();
    if (status && !ALLOWED_STATUS.includes(status)) return fail("Invalid status");
    if (role) {
      if (admin.role !== "superadmin") throw new ApiError(403, "Only a super admin can change user roles");
      if (!ALLOWED_ROLES.includes(role)) return fail("Invalid role");
      if (String(id) === String(admin._id)) return fail("You cannot change your own role");
    }
    if (!status && !role) return fail("Nothing to update");

    await connectDB();
    const set = {};
    if (status) set.status = status;
    if (role) set.role = role;

    const user = await User.findByIdAndUpdate(id, { $set: set }, { new: true }).select("-passwordHash");
    if (!user) throw new ApiError(404, "User not found");

    if (status) await AuditLog.create({ actor: admin._id, actorRole: admin.role, action: `user.${status}`, targetType: "User", targetId: user._id });
    if (role) await AuditLog.create({ actor: admin._id, actorRole: admin.role, action: `user.role_changed_to_${role}`, targetType: "User", targetId: user._id });

    return ok({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
