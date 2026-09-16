import mongoose from "mongoose";

const WebsiteTemplateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: ["corporate", "industrial", "manufacturing", "trading", "modern", "minimal", "premium"],
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    description: String,
    previewImage: String,
    isPremium: { type: Boolean, default: false },
    defaultColors: {
      primary: { type: String, default: "#f97316" },
      secondary: { type: String, default: "#15803d" },
    },
    defaultFont: { type: String, default: "Inter" },
  },
  { timestamps: true }
);

export default mongoose.models.WebsiteTemplate || mongoose.model("WebsiteTemplate", WebsiteTemplateSchema);
