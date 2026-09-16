import mongoose from "mongoose";

const SocialLinksSchema = new mongoose.Schema(
  {
    website: String,
    facebook: String,
    instagram: String,
    linkedin: String,
    twitter: String,
    youtube: String,
  },
  { _id: false }
);

const BranchSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    city: String,
    state: String,
    country: { type: String, default: "India" },
    pincode: String,
    phone: String,
    email: String,
    isHeadOffice: { type: Boolean, default: false },
    lat: Number,
    lng: Number,
  },
  { _id: true, timestamps: true }
);

const CertificationSchema = new mongoose.Schema(
  {
    title: String,
    issuedBy: String,
    issuedYear: Number,
    fileUrl: String,
  },
  { _id: true, timestamps: true }
);

const DocumentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["gst", "pan", "registration", "other"], default: "other" },
    fileUrl: String,
    verified: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const EmployeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: String,
    role: { type: String, enum: ["owner", "manager", "sales", "support"], default: "sales" },
    permissions: [String],
    status: { type: String, enum: ["active", "invited", "disabled"], default: "invited" },
  },
  { _id: true, timestamps: true }
);

/**
 * Vendor is the tenant root. Every tenant-scoped document (products, leads,
 * enquiries, RFQs, quotations, website, etc.) carries a `vendor` ref back to
 * this document, and all tenant-scoped queries MUST filter by it server-side
 * (never trust a client-supplied vendorId).
 */
const VendorSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Identity
    businessName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    logo: String,
    coverImage: String,
    gallery: [String],
    description: String,
    tagline: String,

    businessType: {
      type: String,
      enum: ["manufacturer", "supplier", "distributor", "wholesaler", "retailer", "dealer", "exporter", "service_provider"],
      required: true,
      index: true,
    },
    establishedYear: Number,

    // Compliance
    gstNumber: String,
    panNumber: String,
    registrationNumber: String,
    documents: [DocumentSchema],
    certifications: [CertificationSchema],

    // Location
    address: String,
    city: { type: String, index: true },
    state: { type: String, index: true },
    country: { type: String, default: "India" },
    pincode: String,
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    branches: [BranchSchema],

    // Contact
    email: { type: String, index: true },
    phone: { type: String, index: true },
    whatsapp: String,
    social: SocialLinksSchema,

    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],

    employees: [EmployeeSchema],

    // Verification / trust
    verification: {
      status: {
        type: String,
        enum: ["unverified", "pending", "verified", "rejected"],
        default: "unverified",
        index: true,
      },
      badges: [
        {
          type: String,
          enum: ["gst_verified", "business_verified", "trusted_seller", "premium_supplier", "verified_supplier"],
        },
      ],
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: Date,
      rejectionReason: String,
    },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    // Vendor lifecycle
    status: {
      type: String,
      enum: ["pending_approval", "approved", "suspended", "rejected"],
      default: "pending_approval",
      index: true,
    },
    onboardingStep: { type: Number, default: 1 },

    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    subscriptionPlan: {
      type: String,
      enum: ["free", "growth", "premium", "enterprise"],
      default: "free",
      index: true,
    },

    analytics: {
      profileViews: { type: Number, default: 0 },
      productViews: { type: Number, default: 0 },
      websiteVisitors: { type: Number, default: 0 },
      leadsCount: { type: Number, default: 0 },
      enquiriesCount: { type: Number, default: 0 },
      callsCount: { type: Number, default: 0 },
    },

    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

VendorSchema.index({ businessName: "text", description: "text", tagline: "text" });
VendorSchema.index({ city: 1, businessType: 1, status: 1 });

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
