import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import { ok, getPagination, buildMeta } from "@/lib/utils/api";
import { escapeRegex } from "@/lib/utils/sanitize";

// Advanced marketplace product search (spec section 5).
// Example: /api/products?category=industrial-machinery&city=delhi&sort=price_low
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  await connectDB();

  const { page, limit, skip } = getPagination(searchParams);
  const query = { status: "active" };

  const q = searchParams.get("q");
  if (q) query.$text = { $search: q };

  const category = searchParams.get("category");
  if (category) query.category = category;

  const subCategory = searchParams.get("subCategory");
  if (subCategory) query.subCategory = subCategory;

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  if (minPrice) query["price.min"] = { $gte: Number(minPrice) };
  if (maxPrice) query["price.max"] = { ...(query["price.max"] || {}), $lte: Number(maxPrice) };

  if (searchParams.get("availability")) query.availability = searchParams.get("availability");
  if (searchParams.get("featured") === "true") query.isFeatured = true;

  let sort = { createdAt: -1 };
  const sortParam = searchParams.get("sort");
  if (sortParam === "newest") sort = { createdAt: -1 };
  if (sortParam === "popular") sort = { viewCount: -1 };
  if (sortParam === "price_low") sort = { "price.min": 1 };
  if (sortParam === "price_high") sort = { "price.min": -1 };

  let vendorFilter = null;
  const city = searchParams.get("city");
  const businessType = searchParams.get("businessType");
  const verifiedOnly = searchParams.get("verified") === "true";

  if (city || businessType || verifiedOnly) {
    const Vendor = (await import("@/models/Vendor")).default;
    const vq = { status: "approved" };
    if (city) vq.city = new RegExp(`^${escapeRegex(city)}$`, "i");
    if (businessType) vq.businessType = businessType;
    if (verifiedOnly) vq["verification.status"] = "verified";
    const vendorIds = await Vendor.find(vq).distinct("_id");
    query.vendor = { $in: vendorIds };
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("vendor", "businessName slug city state verification ratingAverage businessType")
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return ok({ products, meta: buildMeta({ page, limit, total }) });
}
