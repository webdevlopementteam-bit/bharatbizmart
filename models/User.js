import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    line1: String,
    line2: String,
    city: String,
    state: String,
    country: { type: String, default: "India" },
    pincode: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, index: true, sparse: true },
    passwordHash: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ["buyer", "vendor", "admin", "superadmin"],
      default: "buyer",
      index: true,
    },

    // Set when role === "vendor" and links to their business profile.
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },

    avatar: { type: String },
    addresses: [AddressSchema],

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    otpCode: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },

    savedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    savedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }],

    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
      index: true,
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

UserSchema.index({ name: "text", email: "text" });

export default mongoose.models.User || mongoose.model("User", UserSchema);
