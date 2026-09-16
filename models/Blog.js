import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: String,
    content: { type: String, required: true },
    featuredImage: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory" },
    tags: [String],
    seo: { title: String, description: String, keywords: [String] },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: Date,
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BlogSchema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
