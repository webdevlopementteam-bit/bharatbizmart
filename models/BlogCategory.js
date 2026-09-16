import mongoose from "mongoose";

const BlogCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.BlogCategory || mongoose.model("BlogCategory", BlogCategorySchema);
