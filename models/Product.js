import mongoose from "mongoose";

const PriceSchema = new mongoose.Schema(
  {
    min: Number,
    max: Number,
    unit: { type: String, default: "piece" },
    currency: { type: String, default: "INR" },
    isNegotiable: { type: Boolean, default: true },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },

    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    images: [String],

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", index: true },

    price: PriceSchema,
    moq: { type: Number, default: 1 },
    moqUnit: { type: String, default: "piece" },
    // Quantity-based bulk pricing (e.g. 1-99 units @ X, 100-499 @ Y, 500+ @ Z) —
    // shown as a price-break table on the product page, IndiaMART/TradeIndia style.
    priceTiers: [
      {
        minQty: { type: Number, required: true },
        maxQty: Number, // omitted/null on the last tier means "and above"
        price: { type: Number, required: true },
        _id: false,
      },
    ],

    description: String,
    specifications: [{ key: String, value: String }],
    features: [String],
    applications: [String],
    packagingDetails: String,
    deliveryDetails: String,
    paymentTerms: String,

    availability: {
      type: String,
      enum: ["in_stock", "out_of_stock", "made_to_order"],
      default: "in_stock",
    },
    deliveryLocations: [String],

    tags: [String],

    viewCount: { type: Number, default: 0 },
    enquiryCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["draft", "pending_approval", "active", "rejected", "archived"],
      default: "active",
      index: true,
    },
    isFeatured: { type: Boolean, default: false },

    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ vendor: 1, status: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
