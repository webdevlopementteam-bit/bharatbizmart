import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    senderType: { type: String, enum: ["buyer", "vendor"], required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    text: String,
    attachments: [String],
    sharedProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    sharedRfq: { type: mongoose.Schema.Types.ObjectId, ref: "RFQ" },
    sharedQuotation: { type: mongoose.Schema.Types.ObjectId, ref: "Quotation" },

    readAt: Date,
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
