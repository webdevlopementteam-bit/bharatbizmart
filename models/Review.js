import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

    rating: { type: Number, required: true, min: 1, max: 5 },
    categoryRatings: {
      productQuality: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      delivery: { type: Number, min: 1, max: 5 },
      pricing: { type: Number, min: 1, max: 5 },
    },
    title: String,
    comment: String,
    images: [String],

    isVerifiedPurchase: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected", "reported"], default: "approved", index: true },
    reportReason: String,

    vendorReply: {
      text: String,
      repliedAt: Date,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ vendor: 1, status: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
