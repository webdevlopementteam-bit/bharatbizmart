import mongoose from "mongoose";

// Admin-managed static pages (About, Privacy, Terms, Refund, FAQ...) so
// nothing is hardcoded in the frontend.
const PageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true },
    seo: { title: String, description: String },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Page || mongoose.model("Page", PageSchema);
