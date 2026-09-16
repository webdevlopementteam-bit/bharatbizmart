import mongoose from "mongoose";

// Audit trail of vendor verification submissions/reviews (Vendor.verification
// holds the current state; this collection keeps the history).
const VerificationSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    documents: [
      {
        type: { type: String, enum: ["gst", "pan", "registration", "certification", "other"] },
        fileUrl: String,
      },
    ],
    requestedBadges: [String],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    rejectionReason: String,
  },
  { timestamps: true }
);

export default mongoose.models.Verification || mongoose.model("Verification", VerificationSchema);
