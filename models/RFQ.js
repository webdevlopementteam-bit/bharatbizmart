import mongoose from "mongoose";

const RFQSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    productName: String,
    quantity: String,
    specifications: String,
    budget: String,
    deliveryLocation: String,
    requiredByDate: Date,
    description: String,
    attachments: [String],

    // Vendors matched (by category/location) who were notified about this RFQ.
    notifiedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],
    quotations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quotation" }],

    status: {
      type: String,
      enum: ["open", "closed", "expired", "awarded"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

RFQSchema.index({ title: "text", description: "text" });
RFQSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.RFQ || mongoose.model("RFQ", RFQSchema);
