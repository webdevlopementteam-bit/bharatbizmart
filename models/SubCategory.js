import mongoose from "mongoose";

const SubCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    image: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    productCount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true }
);

SubCategorySchema.index({ name: "text" });

export default mongoose.models.SubCategory || mongoose.model("SubCategory", SubCategorySchema);
