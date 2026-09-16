import mongoose from "mongoose";

const QuotationSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    rfq: { type: mongoose.Schema.Types.ObjectId, ref: "RFQ", index: true },
    enquiry: { type: mongoose.Schema.Types.ObjectId, ref: "Enquiry" },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

    productName: String,
    quantity: Number,
    unitPrice: Number,
    discount: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 18 },
    shippingCharge: { type: Number, default: 0 },
    totalAmount: Number,

    deliveryTime: String,
    paymentTerms: String,
    validTill: Date,
    notes: String,

    pdfUrl: String,

    status: {
      type: String,
      enum: ["sent", "accepted", "rejected", "negotiating", "expired"],
      default: "sent",
      index: true,
    },
  },
  { timestamps: true }
);

// Mongoose 9 dropped callback-style `next()` middleware — a synchronous
// (or async, if needed) function that just returns is now the only form.
QuotationSchema.pre("save", function computeTotal() {
  const subtotal = (this.unitPrice || 0) * (this.quantity || 0) - (this.discount || 0);
  const gst = subtotal * ((this.gstPercent || 0) / 100);
  this.totalAmount = Math.round((subtotal + gst + (this.shippingCharge || 0)) * 100) / 100;
});

QuotationSchema.index({ vendor: 1, status: 1, createdAt: -1 });

export default mongoose.models.Quotation || mongoose.model("Quotation", QuotationSchema);
