import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    images: [String],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    description: String,
    priceRange: {
      min: Number,
      max: Number,
      unit: { type: String, default: "project" },
    },
    features: [String],
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    seo: { title: String, description: String, keywords: [String] },
  },
  { timestamps: true }
);

ServiceSchema.index({ name: "text", description: "text" });

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);
