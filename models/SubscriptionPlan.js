import mongoose from "mongoose";

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    key: { type: String, enum: ["free", "growth", "premium", "enterprise"], required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    billingCycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },

    limits: {
      products: { type: Number, default: 10 },
      services: { type: Number, default: 5 },
      images: { type: Number, default: 5 },
      leadsPerMonth: { type: Number, default: 20 },
      branches: { type: Number, default: 1 },
      employees: { type: Number, default: 1 },
      customDomain: { type: Boolean, default: false },
      featuredListing: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      premiumTemplates: { type: Boolean, default: false },
    },

    features: [String],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.SubscriptionPlan || mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
