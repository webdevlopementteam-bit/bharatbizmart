import mongoose from "mongoose";

/**
 * One Website document per Vendor. This is what powers the automatically
 * generated mini business site served at `<subdomain>.<ROOT_DOMAIN>` (and
 * optionally a connected custom domain). Nothing here is a static build —
 * the site is rendered dynamically from this document + the vendor's
 * products/services/reviews at request time.
 */
const WebsiteSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, unique: true, index: true },

    subdomain: { type: String, required: true, unique: true, index: true },

    template: { type: String, enum: ["corporate", "industrial", "manufacturing", "trading", "modern", "minimal", "premium"], default: "modern" },
    theme: {
      primaryColor: { type: String, default: "#f97316" },
      secondaryColor: { type: String, default: "#15803d" },
      font: { type: String, default: "Inter" },
      headerStyle: { type: String, enum: ["classic", "centered", "minimal"], default: "classic" },
      heroStyle: { type: String, enum: ["image", "gradient", "video"], default: "gradient" },
      productLayout: { type: String, enum: ["grid", "list"], default: "grid" },
    },
    favicon: String,

    tagline: String,
    aboutContent: String,
    whyChooseUs: [{ title: String, description: String, icon: String }],
    testimonials: [{ name: String, company: String, text: String, rating: Number }],

    contact: {
      showMap: { type: Boolean, default: true },
      showWhatsapp: { type: Boolean, default: true },
      showContactForm: { type: Boolean, default: true },
    },

    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
    },

    status: { type: String, enum: ["draft", "live", "suspended"], default: "draft", index: true },
    publishedAt: Date,

    visitorCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Website || mongoose.model("Website", WebsiteSchema);
