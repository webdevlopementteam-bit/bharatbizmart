import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", index: true },

    type: {
      type: String,
      enum: [
        "new_lead",
        "new_enquiry",
        "new_message",
        "rfq_received",
        "quotation_received",
        "subscription_expiry",
        "verification_approved",
        "verification_rejected",
        "product_approved",
        "review_received",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: String,
    link: String,
    isRead: { type: Boolean, default: false, index: true },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
