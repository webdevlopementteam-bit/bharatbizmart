
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import slugify from "slugify";

import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Website from "../models/Website.js";
import WebsiteTemplate from "../models/WebsiteTemplate.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Product from "../models/Product.js";
import Service from "../models/Service.js";
import Location from "../models/Location.js";
import Enquiry from "../models/Enquiry.js";
import Lead from "../models/Lead.js";
import RFQ from "../models/RFQ.js";
import Review from "../models/Review.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Subscription from "../models/Subscription.js";
import BlogCategory from "../models/BlogCategory.js";
import Blog from "../models/Blog.js";
import Page from "../models/Page.js";
import Banner from "../models/Banner.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bharatbizmart";

const slug = (s) => slugify(s, { lower: true, strict: true });
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const CITIES = [
  { city: "Delhi", state: "Delhi" },
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Surat", state: "Gujarat" },
  { city: "Ludhiana", state: "Punjab" },
  { city: "Coimbatore", state: "Tamil Nadu" },
  { city: "Noida", state: "Uttar Pradesh" },
];

const CATEGORY_TREE = [
  { name: "Industrial Machinery", icon: "Cog", subs: ["Hydraulic Equipment", "CNC Machines", "Compressors"] },
  { name: "Electrical Equipment", icon: "Zap", subs: ["Switchgear", "Transformers", "Cables & Wires"] },
  { name: "Construction Material", icon: "Building2", subs: ["Cement", "Steel Bars", "Bricks & Blocks"] },
  { name: "Packaging", icon: "Package", subs: ["Corrugated Boxes", "Plastic Packaging", "Labels"] },
  { name: "Chemicals", icon: "FlaskConical", subs: ["Industrial Chemicals", "Dyes & Pigments", "Adhesives"] },
  { name: "Electronics", icon: "Cpu", subs: ["Circuit Boards", "Sensors", "LED Lighting"] },
  { name: "Automobile Parts", icon: "Car", subs: ["Engine Parts", "Brake Systems", "Tyres"] },
  { name: "Textile", icon: "Shirt", subs: ["Cotton Fabric", "Yarn", "Garments"] },
  { name: "Food Products", icon: "Wheat", subs: ["Spices", "Grains & Pulses", "Packaged Foods"] },
  { name: "Medical Equipment", icon: "Stethoscope", subs: ["Surgical Instruments", "Diagnostic Equipment", "Hospital Furniture"] },
];

const BUSINESS_TYPES = ["manufacturer", "supplier", "distributor", "wholesaler", "retailer", "dealer", "exporter", "service_provider"];

const SERVICE_CATALOG = [
  { name: "Consulting & Advisory", features: ["Free initial assessment", "Dedicated account manager", "Custom proposals"] },
  { name: "Installation & Commissioning", features: ["On-site setup", "Staff training included", "Post-install support"] },
  { name: "Annual Maintenance Contract", features: ["Quarterly inspections", "Priority breakdown support", "Genuine spare parts"] },
  { name: "Repair & Servicing", features: ["Same-day diagnosis", "Warranty on repairs", "Pick-up & drop available"] },
  { name: "Custom Fabrication", features: ["Made to specification", "Material sourcing included", "Quality inspection report"] },
  { name: "Logistics & Transportation", features: ["Pan-India delivery", "Real-time tracking", "Insured shipments"] },
];
const COMPANY_PREFIXES = ["Shree", "Om", "National", "Prime", "Bharat", "Royal", "Sunrise", "Apex", "Elite", "Global", "United", "Star", "Metro", "Deccan", "Vishwa"];
const COMPANY_SUFFIXES = ["Industries", "Enterprises", "Traders", "Engineering Works", "Corporation", "Exports", "Manufacturing Co.", "Trading Co.", "Pvt Ltd", "Suppliers"];

async function main() {
  console.log("Connecting to", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  console.log("Clearing existing demo collections...");
  await Promise.all([
    User.deleteMany({}), Vendor.deleteMany({}), Website.deleteMany({}), Category.deleteMany({}),
    SubCategory.deleteMany({}), Product.deleteMany({}), Service.deleteMany({}), Location.deleteMany({}), Enquiry.deleteMany({}),
    Lead.deleteMany({}), RFQ.deleteMany({}), Review.deleteMany({}), SubscriptionPlan.deleteMany({}),
    Subscription.deleteMany({}), BlogCategory.deleteMany({}), Blog.deleteMany({}), Page.deleteMany({}),
    Banner.deleteMany({}), WebsiteTemplate.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("password123", 10);

  // --- Platform accounts ---
  await User.create({ name: "Super Admin", email: "superadmin@bharatbizmart.com", passwordHash, role: "superadmin" });
  await User.create({ name: "Admin User", email: "admin@bharatbizmart.com", passwordHash, role: "admin" });
  console.log("Created super admin (superadmin@bharatbizmart.com) and admin (admin@bharatbizmart.com), password: password123");

  // --- Subscription plans ---
  const plans = await SubscriptionPlan.insertMany([
    { key: "free", name: "Free", price: 0, order: 1, limits: { products: 10, services: 5, images: 5, leadsPerMonth: 20, branches: 1, employees: 1 }, features: ["Basic profile", "Marketplace listing", "Basic website"] },
    { key: "growth", name: "Growth", price: 999, order: 2, limits: { products: 50, services: 20, images: 15, leadsPerMonth: 100, branches: 2, employees: 3, advancedAnalytics: true }, features: ["More products", "Premium profile", "Analytics", "Custom branding"] },
    { key: "premium", name: "Premium", price: 2499, order: 3, limits: { products: 500, services: 100, images: 40, leadsPerMonth: 500, branches: 5, employees: 10, customDomain: true, featuredListing: true, premiumTemplates: true, advancedAnalytics: true }, features: ["Unlimited-scale products", "Priority leads", "Custom domain", "Premium templates"] },
    { key: "enterprise", name: "Enterprise", price: 9999, order: 4, limits: { products: 100000, services: 1000, images: 100, leadsPerMonth: 100000, branches: 50, employees: 50, customDomain: true, featuredListing: true, premiumTemplates: true, advancedAnalytics: true, apiAccess: true }, features: ["Multiple branches", "Advanced CRM", "API access", "Dedicated support"] },
  ]);
  console.log(`Created ${plans.length} subscription plans`);

  // --- Website templates ---
  await WebsiteTemplate.insertMany([
    { key: "corporate", name: "Corporate" },
    { key: "industrial", name: "Industrial" },
    { key: "manufacturing", name: "Manufacturing" },
    { key: "trading", name: "Trading" },
    { key: "modern", name: "Modern" },
    { key: "minimal", name: "Minimal" },
    { key: "premium", name: "Premium", isPremium: true },
  ]);

  // --- Locations ---
  const locations = await Location.insertMany(
    CITIES.map((c) => ({ ...c, slug: slug(c.city), isPopular: true, vendorCount: 0 }))
  );
  console.log(`Created ${locations.length} locations`);

  // --- Categories & Subcategories ---
  const categories = [];
  const subCategories = [];
  for (const cat of CATEGORY_TREE) {
    const category = await Category.create({ name: cat.name, slug: slug(cat.name), icon: cat.icon, isFeatured: true });
    categories.push(category);
    for (const subName of cat.subs) {
      const sub = await Category.create({ name: subName, slug: slug(`${cat.name}-${subName}`), parent: category._id });
      await SubCategory.create({ name: subName, slug: slug(`sub-${cat.name}-${subName}`), category: category._id });
      subCategories.push(sub);
    }
  }
  console.log(`Created ${categories.length} categories + ${subCategories.length} subcategories`);

  // --- Vendors + Websites + Subscriptions ---
  const vendors = [];
  for (let i = 0; i < 50; i++) {
    const name = `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)}`;
    const uniqueName = `${name} ${i + 1}`;
    const loc = pick(CITIES);
    const businessType = pick(BUSINESS_TYPES);
    const category = pick(categories);

    const owner = await User.create({
      name: `Owner ${i + 1}`,
      email: `vendor${i + 1}@bharatbizmart.com`,
      phone: `9${randInt(100000000, 999999999)}`,
      passwordHash,
      role: "vendor",
    });

    const vendorSlug = slug(uniqueName);
    const isApproved = i < 45; // most approved, a few pending for admin demo
    const isServiceType = businessType === "service_provider";
    const description = isServiceType
      ? `${uniqueName} is a trusted service provider in the ${category.name.toLowerCase()} space, based in ${loc.city}, delivering reliable, professional service to businesses across India.`
      : `${uniqueName} is a leading ${businessType} of ${category.name.toLowerCase()} based in ${loc.city}, serving customers across India with quality products and reliable service.`;
    const tagline = isServiceType
      ? `Professional ${category.name.toLowerCase()} services you can rely on`
      : `Your trusted ${businessType} for ${category.name}`;
    const vendor = await Vendor.create({
      owner: owner._id,
      businessName: uniqueName,
      slug: vendorSlug,
      businessType,
      establishedYear: randInt(1990, 2022),
      gstNumber: `GSTIN${randInt(1000000000, 9999999999)}`,
      description,
      tagline,
      logo: `https://picsum.photos/seed/${vendorSlug}-logo/200/200`,
      coverImage: `https://picsum.photos/seed/${vendorSlug}-cover/1200/400`,
      address: `${randInt(1, 200)}, Industrial Area`,
      city: loc.city,
      state: loc.state,
      pincode: `${randInt(100000, 999999)}`,
      email: owner.email,
      phone: owner.phone,
      whatsapp: owner.phone,
      categories: [category._id],
      subscriptionPlan: pick(["free", "free", "growth", "premium"]),
      status: isApproved ? "approved" : "pending_approval",
      verification: {
        status: isApproved ? "verified" : "unverified",
        badges: isApproved ? [pick(["verified_supplier", "business_verified", "trusted_seller"])] : [],
      },
      ratingAverage: isApproved ? +(randInt(35, 50) / 10).toFixed(1) : 0,
      ratingCount: isApproved ? randInt(0, 40) : 0,
    });

    owner.vendor = vendor._id;
    await owner.save();

    await Website.create({
      vendor: vendor._id,
      subdomain: vendorSlug,
      template: pick(["modern", "corporate", "industrial", "trading", "minimal"]),
      tagline: vendor.tagline,
      aboutContent: vendor.description,
      status: isApproved ? "live" : "draft",
      publishedAt: isApproved ? new Date() : undefined,
      seo: { title: vendor.businessName, description: vendor.description?.slice(0, 155) },
    });

    const planDoc = plans.find((p) => p.key === vendor.subscriptionPlan);
    await Subscription.create({ vendor: vendor._id, plan: planDoc._id, planKey: vendor.subscriptionPlan, status: "active", startedAt: new Date() });

    vendors.push(vendor);
  }
  console.log(`Created ${vendors.length} vendors with websites & subscriptions`);

  await Promise.all(
    locations.map((l) => Location.updateOne({ _id: l._id }, { $set: { vendorCount: vendors.filter((v) => v.city === l.city).length } }))
  );

  // --- Products (product-type vendors only — service_provider vendors get Services instead) ---
  const approvedVendors = vendors.filter((v) => v.status === "approved" && v.businessType !== "service_provider");
  const approvedServiceVendors = vendors.filter((v) => v.status === "approved" && v.businessType === "service_provider");
  const products = [];
  const productAdjectives = ["Heavy Duty", "Premium", "Industrial Grade", "High Precision", "Automatic", "Compact", "Portable", "Standard"];
  for (let i = 0; i < 100; i++) {
    const vendor = pick(approvedVendors);
    const category = pick(categories);
    const productName = `${pick(productAdjectives)} ${category.name.replace(/s$/, "")} Model-${randInt(100, 999)}`;
    const minPrice = randInt(500, 50000);
    const productSlug = slug(`${productName}-${vendor.slug}`);

    const product = await Product.create({
      vendor: vendor._id,
      name: productName,
      slug: productSlug,
      category: category._id,
      images: [
        `https://picsum.photos/seed/${productSlug}-1/600/600`,
        `https://picsum.photos/seed/${productSlug}-2/600/600`,
      ],
      price: { min: minPrice, max: minPrice + randInt(500, 5000), unit: "piece" },
      moq: pick([1, 5, 10, 50, 100]),
      moqUnit: "piece",
      description: `${productName} manufactured by ${vendor.businessName}. Built to industry standards with reliable performance and durability, suitable for industrial and commercial use.`,
      specifications: [
        { key: "Material", value: pick(["Stainless Steel", "Mild Steel", "Aluminium", "Cast Iron"]) },
        { key: "Warranty", value: `${randInt(1, 5)} Year(s)` },
      ],
      features: ["Durable construction", "Low maintenance", "Energy efficient"],
      packagingDetails: "Standard export packaging",
      deliveryDetails: `${randInt(3, 21)} days`,
      paymentTerms: pick(["50% advance, balance before dispatch", "100% advance", "Letter of Credit"]),
      isFeatured: i < 15,
      viewCount: randInt(0, 500),
      status: "active",
    });
    products.push(product);
  }
  console.log(`Created ${products.length} products`);

  // --- Services (for service_provider vendors) ---
  const services = [];
  for (const vendor of approvedServiceVendors) {
    const offerings = [...SERVICE_CATALOG].sort(() => Math.random() - 0.5).slice(0, randInt(3, 5));
    for (const offering of offerings) {
      const serviceSlug = slug(`${offering.name}-${vendor.slug}`);
      const service = await Service.create({
        vendor: vendor._id,
        name: offering.name,
        slug: serviceSlug,
        images: [`https://picsum.photos/seed/${serviceSlug}/600/400`],
        category: pick(categories)._id,
        description: `${offering.name} delivered by ${vendor.businessName}, tailored to your business needs with reliable turnaround and transparent pricing.`,
        priceRange: { min: randInt(2000, 20000), max: randInt(25000, 100000), unit: "project" },
        features: offering.features,
        status: "active",
      });
      services.push(service);
    }
  }
  console.log(`Created ${services.length} services across ${approvedServiceVendors.length} service-provider vendors`);

  // --- Buyers ---
  const buyers = [];
  for (let i = 0; i < 100; i++) {
    const buyer = await User.create({
      name: `Buyer ${i + 1}`,
      email: `buyer${i + 1}@bharatbizmart.com`,
      phone: `8${randInt(100000000, 999999999)}`,
      passwordHash,
      role: "buyer",
    });
    buyers.push(buyer);
  }
  console.log(`Created ${buyers.length} buyers (password123 for all seeded users)`);

  // --- Enquiries + Leads ---
  for (let i = 0; i < 100; i++) {
    const product = pick(products);
    const vendor = vendors.find((v) => String(v._id) === String(product.vendor));
    const buyer = pick(buyers);
    const enquiry = await Enquiry.create({
      vendor: vendor._id,
      product: product._id,
      buyer: buyer._id,
      name: buyer.name,
      mobile: buyer.phone,
      email: buyer.email,
      quantity: `${randInt(10, 500)} units`,
      requirement: `Looking for ${product.name}`,
      deliveryLocation: pick(CITIES).city,
      status: pick(["new", "contacted", "qualified", "won", "lost"]),
    });
    await Lead.create({
      vendor: vendor._id, buyerName: buyer.name, phone: buyer.phone, email: buyer.email, product: product._id,
      requirement: enquiry.requirement, quantity: enquiry.quantity, location: enquiry.deliveryLocation,
      source: "enquiry", sourceRef: enquiry._id, sourceRefModel: "Enquiry", status: enquiry.status,
    });
    await Vendor.updateOne({ _id: vendor._id }, { $inc: { "analytics.enquiriesCount": 1, "analytics.leadsCount": 1 } });
  }
  console.log("Created 100 enquiries + leads");

  // --- RFQs ---
  for (let i = 0; i < 50; i++) {
    const category = pick(categories);
    const buyer = pick(buyers);
    await RFQ.create({
      buyer: buyer._id,
      title: `Looking for ${randInt(50, 1000)} units of ${category.name}`,
      category: category._id,
      quantity: `${randInt(50, 1000)} units`,
      budget: `₹${randInt(50000, 500000)}`,
      deliveryLocation: pick(CITIES).city,
      description: `We are sourcing ${category.name.toLowerCase()} for our upcoming project. Please share your best quotation.`,
      status: "open",
    });
  }
  console.log("Created 50 RFQs");

  // --- Reviews (across both product and service vendors) ---
  const allApprovedVendors = [...approvedVendors, ...approvedServiceVendors];
  for (let i = 0; i < 50; i++) {
    const vendor = pick(allApprovedVendors);
    const buyer = pick(buyers);
    await Review.create({
      vendor: vendor._id,
      buyer: buyer._id,
      rating: randInt(3, 5),
      comment: pick([
        "Great quality products and timely delivery.",
        "Very professional and responsive team.",
        "Good pricing, will order again.",
        "Product quality matched exactly what was promised.",
        "Excellent communication throughout the order process.",
      ]),
      isVerifiedPurchase: Math.random() > 0.4,
      status: "approved",
    });
  }
  console.log("Created 50 reviews");

  // --- Blog & CMS ---
  const blogCategory = await BlogCategory.create({ name: "B2B Insights", slug: "b2b-insights" });
  const admin = await User.findOne({ role: "admin" });
  await Blog.insertMany([
    {
      title: "5 Tips to Find Reliable Suppliers Online",
      slug: "5-tips-to-find-reliable-suppliers-online",
      excerpt: "Learn how to vet and shortlist trustworthy B2B suppliers.",
      content: "Finding a reliable supplier online starts with verification. Look for GST-verified and business-verified badges, check ratings and reviews, and always request samples before placing a bulk order...",
      category: blogCategory._id,
      author: admin._id,
      status: "published",
      publishedAt: new Date(),
      tags: ["suppliers", "sourcing"],
    },
    {
      title: "How to Get Your Business Verified",
      slug: "how-to-get-your-business-verified",
      excerpt: "A step-by-step guide to getting the Verified Supplier badge.",
      content: "Getting verified builds buyer trust instantly. Upload your GST certificate, PAN card and business registration documents from your dashboard, and our team will review them within 2-3 business days...",
      category: blogCategory._id,
      author: admin._id,
      status: "published",
      publishedAt: new Date(),
      tags: ["verification", "sellers"],
    },
  ]);

  await Page.insertMany([
    { title: "About Us", slug: "about", content: "BharatBizMart connects buyers with verified manufacturers, suppliers, wholesalers and service providers across India." },
    { title: "Privacy Policy", slug: "privacy", content: "We respect your privacy and are committed to protecting your personal data..." },
    { title: "Terms of Service", slug: "terms", content: "By using BharatBizMart, you agree to the following terms and conditions..." },
    { title: "Refund Policy", slug: "refund", content: "Subscription fees are refundable within 7 days of purchase if no leads have been received..." },
    { title: "Help Center", slug: "help", content: "Need help? Contact our support team at support@bharatbizmart.com." },
    { title: "Contact", slug: "contact", content: "Reach us at support@bharatbizmart.com or call +91-11-4000-0000." },
    { title: "Careers", slug: "careers", content: "We are always looking for talented people. Write to careers@bharatbizmart.com." },
    { title: "Pricing", slug: "pricing", content: "See our Subscription Plans page for detailed pricing." },
    { title: "Verification", slug: "verification", content: "Learn how business verification works on BharatBizMart." },
  ]);

  await Banner.create({
    title: "Grow Your Business Online",
    subtitle: "Join thousands of verified sellers",
    linkUrl: "/register-business",
    ctaLabel: "Register Now",
    placement: "homepage_hero",
    status: "active",
  });

  console.log("Created blog posts, CMS pages and a banner");
  console.log("\nSeed complete.");
  console.log("Login as vendor1@bharatbizmart.com / password123 (approved, has products)");
  console.log("Login as buyer1@bharatbizmart.com / password123");
  console.log("Login as admin@bharatbizmart.com / password123");
  console.log("Login as superadmin@bharatbizmart.com / password123");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
