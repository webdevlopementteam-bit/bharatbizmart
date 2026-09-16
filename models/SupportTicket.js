import mongoose from "mongoose";

const SupportTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    subject: { type: String, required: true },
    category: { type: String, enum: ["billing", "technical", "account", "verification", "other"], default: "other" },
    description: String,
    attachments: [String],
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open", index: true },
    replies: [
      {
        text: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        isStaff: Boolean,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);
