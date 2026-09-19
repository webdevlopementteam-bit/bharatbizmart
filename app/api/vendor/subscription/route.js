import { connectDB } from "@/lib/db/connect";
import Subscription from "@/models/Subscription";
import Payment from "@/models/Payment";
import Invoice from "@/models/Invoice";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import Coupon from "@/models/Coupon";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/payments/razorpay";
import { activateSubscriptionPlan } from "@/lib/payments/activateSubscriptionPlan";

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
 * Starts a plan change. Free plans (and any deployment without a Razorpay
 * key configured) activate immediately, same as before. A real paid
 * upgrade instead creates a Razorpay order and returns it for the client to
 * open in checkout — nothing is activated until /verify confirms payment.
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

    if (amount <= 0 || !isRazorpayConfigured()) {
      const payment = await Payment.create({
        vendor: vendor._id,
        amount,
        provider: isRazorpayConfigured() ? "razorpay" : "manual",
        status: "success",
        purpose: "subscription",
        meta: { planKey, couponCode },
      });
      const subscription = await activateSubscriptionPlan({ vendor, plan, amount, coupon, payment });
      return ok({ activated: true, subscription, payment });
    }

    const payment = await Payment.create({
      vendor: vendor._id,
      amount,
      provider: "razorpay",
      status: "created",
      purpose: "subscription",
      meta: { planKey, couponCode },
    });

    const order = await createRazorpayOrder({
      amountInRupees: amount,
      receipt: `sub_${payment._id}`,
      notes: { vendorId: String(vendor._id), planKey, paymentId: String(payment._id) },
    });

    payment.providerOrderId = order.id;
    await payment.save();

    return ok({
      requiresPayment: true,
      paymentId: String(payment._id),
      order: { id: order.id, amount: order.amount, currency: order.currency },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
