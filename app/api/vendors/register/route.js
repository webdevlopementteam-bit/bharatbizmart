import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import Website from "@/models/Website";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { hashPassword } from "@/lib/auth/password";
import { issueSessionToken, buildAuthCookie } from "@/lib/auth/session";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { ok, fail } from "@/lib/utils/api";
import { rateLimitAsync, clientIpFromRequest } from "@/lib/utils/rateLimit";

/**
 * Seller onboarding (spec section 7 + 40): creates the User, the Vendor
 * tenant, its Subscription and its (draft) Website + subdomain — all in one
 * call, made from the final step of the multi-step wizard on the client.
 * The vendor starts `pending_approval`; the website goes `live` once an
 * admin approves it (see /api/admin/vendors/[id]).
 */
export async function POST(request) {
  const { allowed } = await rateLimitAsync(`vendor-register:${clientIpFromRequest(request)}`, { limit: 5, windowMs: 60_000 });
  if (!allowed) return fail("Too many attempts. Please try again in a minute.", 429);

  const body = await request.json();
  const { account, business, location, branding, description, categories, plan, documents } = body || {};

  if (!account?.name || !account?.email || !account?.password) {
    return fail("Account name, email and password are required");
  }
  if (!business?.businessName || !business?.businessType) {
    return fail("Business name and business type are required");
  }

  await connectDB();

  const existingUser = await User.findOne({ email: account.email.toLowerCase() });
  if (existingUser) return fail("An account with this email already exists", 409);

  const passwordHash = await hashPassword(account.password);
  const user = await User.create({
    name: account.name,
    email: account.email.toLowerCase(),
    phone: account.phone,
    passwordHash,
    role: "vendor",
  });

  const slug = await generateUniqueSlug(Vendor, business.businessName, {
    suffixHint: location?.city,
  });

  const vendor = await Vendor.create({
    owner: user._id,
    businessName: business.businessName,
    slug,
    businessType: business.businessType,
    establishedYear: business.establishedYear,
    gstNumber: business.gstNumber,
    panNumber: business.panNumber,
    registrationNumber: business.registrationNumber,
    documents: documents || [],
    address: location?.address,
    city: location?.city,
    state: location?.state,
    country: location?.country || "India",
    pincode: location?.pincode,
    email: account.email.toLowerCase(),
    phone: account.phone,
    logo: branding?.logo,
    coverImage: branding?.coverImage,
    gallery: branding?.gallery || [],
    description,
    categories: categories || [],
    subscriptionPlan: plan || "free",
    status: "pending_approval",
    verification: { status: documents?.length ? "pending" : "unverified" },
  });

  user.vendor = vendor._id;
  await user.save();

  // Subdomain is reserved immediately (same slug), so the vendor's future
  // URL is fixed the moment they register; the site itself goes live on approval.
  const website = await Website.create({
    vendor: vendor._id,
    subdomain: slug,
    template: "modern",
    status: "draft",
    seo: {
      title: business.businessName,
      description: description?.slice(0, 160),
    },
  });

  const subscriptionPlanDoc = await SubscriptionPlan.findOne({ key: plan || "free" });
  await Subscription.create({
    vendor: vendor._id,
    plan: subscriptionPlanDoc?._id,
    planKey: plan || "free",
    status: "active",
    startedAt: new Date(),
  });

  const token = issueSessionToken(user);
  const res = ok({
    user: { id: user._id, name: user.name, email: user.email, role: user.role, vendor: vendor._id },
    vendor: { id: vendor._id, slug: vendor.slug, status: vendor.status },
    website: { subdomain: website.subdomain, status: website.status },
  });
  res.cookies.set(buildAuthCookie(token));
  return res;
}
