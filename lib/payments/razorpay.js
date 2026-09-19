import Razorpay from "razorpay";
import crypto from "crypto";

export function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

let client = null;
function getClient() {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return client;
}

/**
 * Creates a Razorpay order for `amountInRupees`. Razorpay's API takes the
 * amount in the smallest currency unit (paise for INR), so this is the one
 * place that conversion happens — every caller/UI works in whole rupees.
 */
export async function createRazorpayOrder({ amountInRupees, receipt, notes }) {
  const order = await getClient().orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: "INR",
    receipt,
    notes,
  });
  return order;
}

/**
 * Verifies the HMAC-SHA256 signature Razorpay's checkout returns after a
 * successful payment (order_id|payment_id signed with the key secret) —
 * this is what actually proves the payment happened and wasn't forged by
 * the client, since razorpay_payment_id alone is just an opaque string
 * anyone could type into the verify endpoint.
 */
export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}
