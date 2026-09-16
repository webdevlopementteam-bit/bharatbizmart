import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },

    lastMessage: String,
    lastMessageAt: Date,
    unreadByBuyer: { type: Number, default: 0 },
    unreadByVendor: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ConversationSchema.index({ buyer: 1, vendor: 1, product: 1 }, { unique: false });

export default mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
