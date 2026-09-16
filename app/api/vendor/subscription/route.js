import { connectDB } from "@/lib/db/connect";
import Subscription from "@/models/Subscription";
import Payment from "@/models/Payment";
import Invoice from "@/models/Invoice";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import Vendor from "@/models/Vendor";
import Coupon from "@/models/Coupon";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    await connectDB();
    const subscription = await Subscription.findOne({ vendor: vendor._id, status: "active" }).populate("plan");
    const invoices = await Invoice.find({ vendor: vendor._id }).sort({ createdAt: -1 }).lean();
    return ok({ subscription, invoices });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * Upgrades/downgrades the vendor's plan. If a real payment provider is
 * configured this is where you'd create a Razorpay/Stripe order and redirect
 * to checkout; without one configured, non-free plans are activated directly
 * so the rest of the platform (limits, custom domains, templates) is fully
 * testable end-to-end, and a Payment+Invoice record is still created for
 * traceability.
 */
export async function POST(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { planKey, couponCode } = await request.json();

    await connectDB();
    const plan = await SubscriptionPlan.findOne({ key: planKey });
    if (!plan) throw new ApiError(404, "Plan not found");

    let amount = plan.price;
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: "active" });
      if (!coupon) throw new ApiError(404, "Invalid or expired coupon code");
      if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(410, "This coupon has expired");
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new ApiError(410, "This coupon has reached its usage limit");
      if (coupon.applicablePlans?.length && !coupon.applicablePlans.includes(planKey)) {
        throw new ApiError(400, "This coupon is not valid for the selected plan");
      }
      amount =
        coupon.discountType === "percent"
          ? Math.round(amount * (1 - coupon.discountValue / 100))
          : Math.max(0, amount - coupon.discountValue);
    }

    const isConfigured = !!process.env.RAZORPAY_KEY_ID;
    const payment = await Payment.create({
      vendor: vendor._id,
      amount,
      provider: isConfigured ? "razorpay" : "manual",
      status: "success",
      purpose: "subscription",
    });

    if (amount > 0) {
      await Invoice.create({
        vendor: vendor._id,
        payment: payment._id,
        invoiceNumber: `INV-${nanoid(8).toUpperCase()}`,
        amount,
        gstAmount: Math.round(amount * 0.18),
        totalAmount: Math.round(amount * 1.18),
        status: "paid",
      });
    }

    if (coupon) {
      await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
    }

    await Subscription.updateMany({ vendor: vendor._id, status: "active" }, { $set: { status: "cancelled" } });
    const subscription = await Subscription.create({
      vendor: vendor._id,
      plan: plan._id,
      planKey: plan.key,
      status: "active",
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await Vendor.updateOne({ _id: vendor._id }, { $set: { subscriptionPlan: plan.key, subscription: subscription._id } });

    return ok({ subscription, payment });
  } catch (err) {
    return handleApiError(err);
  }
}
