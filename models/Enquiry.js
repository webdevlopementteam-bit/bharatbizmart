import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Denormalized contact info so a guest (non-logged-in) buyer can enquire too.
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: String,
    quantity: String,
    requirement: String,
    deliveryLocation: String,
    message: String,

    source: {
      type: String,
      enum: ["get_best_price", "product_page", "vendor_page", "rfq", "website"],
      default: "product_page",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "quotation_sent", "negotiation", "won", "lost"],
      default: "new",
      index: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: [
      {
        text: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    followUpDate: Date,
  },
  { timestamps: true }
);

EnquirySchema.index({ vendor: 1, status: 1, createdAt: -1 });

export default mongoose.models.Enquiry || mongoose.model("Enquiry", EnquirySchema);
