import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    pdfUrl: String,
    status: { type: String, enum: ["paid", "unpaid", "void"], default: "paid" },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
