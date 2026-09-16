import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
    planKey: { type: String, enum: ["free", "growth", "premium", "enterprise"], required: true },

    status: { type: String, enum: ["active", "expired", "cancelled", "trial"], default: "active", index: true },
    startedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    autoRenew: { type: Boolean, default: true },

    usage: {
      products: { type: Number, default: 0 },
      leadsThisMonth: { type: Number, default: 0 },
      employees: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ vendor: 1, status: 1 });

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
