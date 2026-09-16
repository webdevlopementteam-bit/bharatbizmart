import mongoose from "mongoose";

const DomainSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    hostname: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },

    verificationToken: { type: String, required: true },
    verificationMethod: { type: String, enum: ["txt", "cname"], default: "cname" },
    cnameTarget: { type: String },

    status: {
      type: String,
      enum: ["pending_dns", "verified", "failed", "disabled"],
      default: "pending_dns",
      index: true,
    },
    sslStatus: { type: String, enum: ["pending", "issued", "failed"], default: "pending" },
    verifiedAt: Date,
    lastCheckedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Domain || mongoose.model("Domain", DomainSchema);
