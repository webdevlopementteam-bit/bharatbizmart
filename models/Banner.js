import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    image: String,
    mobileImage: String,
    linkUrl: String,
    ctaLabel: String,
    placement: { type: String, enum: ["homepage_hero", "homepage_strip", "category_top", "sidebar"], default: "homepage_hero" },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model("Banner", BannerSchema);
