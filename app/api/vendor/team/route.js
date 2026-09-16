import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    return ok({ employees: vendor.employees || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

// Invite a team member (spec section 13 "Manage Employees"). No email delivery
// wired up yet — the invited row is created immediately in "invited" status,
// ready for an email/SMS provider to notify them.
export async function POST(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { name, email, role } = await request.json();
    if (!name || !email) return fail("Name and email are required");

    await connectDB();
    const subscription = await Subscription.findOne({ vendor: vendor._id, status: "active" });
    const plan = await SubscriptionPlan.findOne({ key: subscription?.planKey || vendor.subscriptionPlan || "free" });
    if (plan && vendor.employees.length >= plan.limits.employees) {
      throw new ApiError(403, `Your ${plan.name} plan allows up to ${plan.limits.employees} team member(s). Upgrade to add more.`);
    }

    vendor.employees.push({ name, email, role: role || "sales", status: "invited" });
    await vendor.save();

    return ok({ employees: vendor.employees }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
