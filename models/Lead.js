import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },

    buyerName: { type: String, required: true },
    companyName: String,
    phone: String,
    email: String,

    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    requirement: String,
    quantity: String,
    budget: String,
    location: String,

    source: {
      type: String,
      enum: ["enquiry", "rfq", "manual", "chat", "website", "call"],
      default: "manual",
    },
    sourceRef: { type: mongoose.Schema.Types.ObjectId, refPath: "sourceRefModel" },
    sourceRefModel: { type: String, enum: ["Enquiry", "RFQ"] },

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
    activityTimeline: [
      {
        action: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
      },
    ],
    followUpDate: Date,
  },
  { timestamps: true }
);

LeadSchema.index({ vendor: 1, status: 1, createdAt: -1 });

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
