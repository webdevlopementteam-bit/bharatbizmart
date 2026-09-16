import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    discountType: { type: String, enum: ["percent", "flat"], default: "percent" },
    discountValue: { type: Number, required: true },
    applicablePlans: [{ type: String, enum: ["free", "growth", "premium", "enterprise"] }],
    maxUses: Number,
    usedCount: { type: Number, default: 0 },
    expiresAt: Date,
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
