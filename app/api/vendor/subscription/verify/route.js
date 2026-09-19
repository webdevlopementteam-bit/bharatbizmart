import { connectDB } from "@/lib/db/connect";
import Payment from "@/models/Payment";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import Coupon from "@/models/Coupon";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { activateSubscriptionPlan } from "@/lib/payments/activateSubscriptionPlan";

/**
 * Confirms a Razorpay payment the client just completed in checkout and
 * only THEN activates the plan — planKey/couponCode/amount all come from
 * the Payment record created at checkout time (server-trusted), never from
 * whatever the client sends here, so a tampered request can't grant a plan
 * that wasn't actually paid for.
 */
export async function POST(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { paymentId, razorpay_payment_id: razorpayPaymentId, razorpay_order_id: razorpayOrderId, razorpay_signature: razorpaySignature } =
      await request.json();

    if (!paymentId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return fail("Missing payment confirmation fields");
    }

    await connectDB();
    const payment = await Payment.findOne({ _id: paymentId, vendor: vendor._id, purpose: "subscription" });
    if (!payment) throw new ApiError(404, "Payment not found");
    if (payment.status === "success") return ok({ activated: true }); // already processed (double-submit)
    if (payment.providerOrderId !== razorpayOrderId) throw new ApiError(400, "Order mismatch");

    const validSignature = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });
    if (!validSignature) {
      payment.status = "failed";
      await payment.save();
      throw new ApiError(400, "Payment verification failed");
    }

    const { planKey, couponCode } = payment.meta || {};
    const plan = await SubscriptionPlan.findOne({ key: planKey });
    if (!plan) throw new ApiError(404, "Plan not found");
    const coupon = couponCode ? await Coupon.findOne({ code: couponCode.toUpperCase() }) : null;

    payment.status = "success";
    payment.providerPaymentId = razorpayPaymentId;
    await payment.save();

    const subscription = await activateSubscriptionPlan({ vendor, plan, amount: payment.amount, coupon, payment });
    return ok({ activated: true, subscription });
  } catch (err) {
    return handleApiError(err);
  }
}
