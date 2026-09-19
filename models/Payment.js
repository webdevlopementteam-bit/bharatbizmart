import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    provider: { type: String, enum: ["razorpay", "stripe", "manual"], default: "razorpay" },
    providerPaymentId: String,
    providerOrderId: String,

    status: { type: String, enum: ["created", "pending", "success", "failed", "refunded"], default: "created", index: true },
    purpose: { type: String, enum: ["subscription", "advertisement", "coupon", "other"], default: "subscription" },
    // What to activate once this payment verifies — set at order-creation
    // time (server-computed, trusted) and read back at verify time instead
    // of trusting whatever the client resends after the Razorpay redirect.
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

PaymentSchema.index({ vendor: 1, status: 1, createdAt: -1 });

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
