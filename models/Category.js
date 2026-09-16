import mongoose from "mongoose";

// Self-referencing hierarchical category: Category -> SubCategory -> ... (unlimited depth via `parent`)
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    icon: String,
    image: String,
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    vendorCount: { type: Number, default: 0 },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true }
);

CategorySchema.index({ name: "text", description: "text" });

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
