import mongoose from "mongoose";

const AdvertisementSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true },
    type: {
      type: String,
      enum: ["homepage_banner", "category_banner", "sponsored_listing", "featured_supplier", "featured_product"],
      required: true,
    },
    title: String,
    image: String,
    targetUrl: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

    startDate: Date,
    endDate: Date,
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },

    status: { type: String, enum: ["draft", "active", "paused", "expired"], default: "draft", index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Advertisement || mongoose.model("Advertisement", AdvertisementSchema);
