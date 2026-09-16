import mongoose from "mongoose";

// Standalone Branch collection for multi-branch vendors that need branch-level
// querying (e.g. "hydraulic pump suppliers in Delhi" across branch locations).
// Vendor.branches holds the embedded copy used for quick profile rendering.
const BranchSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    name: { type: String, required: true },
    address: String,
    city: { type: String, index: true },
    state: { type: String, index: true },
    country: { type: String, default: "India" },
    pincode: String,
    phone: String,
    email: String,
    isHeadOffice: { type: Boolean, default: false },
    lat: Number,
    lng: Number,
  },
  { timestamps: true }
);

BranchSchema.index({ vendor: 1, city: 1 });

export default mongoose.models.Branch || mongoose.model("Branch", BranchSchema);
