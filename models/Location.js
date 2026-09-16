import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    country: { type: String, default: "India" },
    state: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    district: String,
    pincode: { type: String, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    isPopular: { type: Boolean, default: false },
    vendorCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

LocationSchema.index({ city: "text", state: "text" });

export default mongoose.models.Location || mongoose.model("Location", LocationSchema);
