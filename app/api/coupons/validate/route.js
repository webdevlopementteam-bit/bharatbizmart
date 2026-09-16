import { connectDB } from "@/lib/db/connect";
import Coupon from "@/models/Coupon";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

// Validates a coupon against a subscription plan before checkout (spec section 21).
export async function POST(request) {
  try {
    await requireUser(["vendor"]);
    const { code, planKey } = await request.json();
    if (!code) return fail("Coupon code is required");

    await connectDB();
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: "active" });
    if (!coupon) return fail("Invalid or expired coupon code", 404);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return fail("This coupon has expired", 410);
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return fail("This coupon has reached its usage limit", 410);
    if (coupon.applicablePlans?.length && planKey && !coupon.applicablePlans.includes(planKey)) {
      return fail("This coupon is not valid for the selected plan");
    }

    return ok({ coupon });
  } catch (err) {
    return handleApiError(err);
  }
}
