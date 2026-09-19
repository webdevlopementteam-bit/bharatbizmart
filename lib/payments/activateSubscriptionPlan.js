import Subscription from "@/models/Subscription";
import Invoice from "@/models/Invoice";
import Coupon from "@/models/Coupon";
import Vendor from "@/models/Vendor";
import { nanoid } from "nanoid";

/**
 * Actually switches the vendor onto `plan` and records the invoice. Called
 * either immediately (free plan / no Razorpay key configured) or from
 * /api/vendor/subscription/verify once a real payment's signature has
 * checked out — same activation logic either way.
 */
export async function activateSubscriptionPlan({ vendor, plan, amount, coupon, payment }) {
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

  return subscription;
}
