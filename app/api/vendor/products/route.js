import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { ok, fail, getPagination, buildMeta, stripEmptyRefs, pickFields } from "@/lib/utils/api";

// Excludes vendor, isFeatured, viewCount, enquiryCount — those are never
// client-settable (ownership, paid placement, and analytics counters).
const EDITABLE_FIELDS = [
  "name", "images", "category", "subCategory", "price", "moq", "moqUnit", "priceTiers",
  "description", "specifications", "features", "applications", "packagingDetails",
  "deliveryDetails", "paymentTerms", "availability", "deliveryLocations", "tags", "status", "seo",
];

export async function GET(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);

    const query = { vendor: vendor._id };
    if (searchParams.get("status")) query.status = searchParams.get("status");

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return ok({ products, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const body = stripEmptyRefs(pickFields(await request.json(), EDITABLE_FIELDS), ["category", "subCategory"]);

    if (!body?.name) return fail("Product name is required");

    await connectDB();

    // Enforce plan product limits — never trust the client to self-police this.
    const subscription = await Subscription.findOne({ vendor: vendor._id, status: "active" });
    const plan = await SubscriptionPlan.findOne({ key: subscription?.planKey || vendor.subscriptionPlan || "free" });
    if (plan) {
      const currentCount = await Product.countDocuments({ vendor: vendor._id, status: { $ne: "archived" } });
      if (currentCount >= plan.limits.products) {
        throw new ApiError(403, `Your ${plan.name} plan allows up to ${plan.limits.products} products. Upgrade to add more.`);
      }
    }

    const slug = await generateUniqueSlug(Product, body.name, { suffixHint: vendor.slug });
    const product = await Product.create({ ...body, vendor: vendor._id, slug, status: body.status || "active" });

    return ok({ product }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
