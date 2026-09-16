import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import { ok } from "@/lib/utils/api";
import { getPagination, buildMeta } from "@/lib/utils/api";
import { escapeRegex } from "@/lib/utils/sanitize";

// Public business directory / supplier search (spec sections 4, 26).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  await connectDB();

  const { page, limit, skip } = getPagination(searchParams);
  const query = { status: "approved" };

  const q = searchParams.get("q");
  if (q) query.$text = { $search: q };

  const city = searchParams.get("city");
  if (city) query.city = new RegExp(`^${escapeRegex(city)}$`, "i");

  const state = searchParams.get("state");
  if (state) query.state = new RegExp(`^${escapeRegex(state)}$`, "i");

  const businessType = searchParams.get("businessType");
  if (businessType) query.businessType = businessType;

  const category = searchParams.get("category");
  if (category) query.categories = category;

  if (searchParams.get("verified") === "true") query["verification.status"] = "verified";

  let sort = { ratingAverage: -1, createdAt: -1 };
  const sortParam = searchParams.get("sort");
  if (sortParam === "newest") sort = { createdAt: -1 };
  if (sortParam === "rating") sort = { ratingAverage: -1 };

  const [vendors, total] = await Promise.all([
    Vendor.find(query)
      .select("businessName slug logo coverImage city state businessType ratingAverage ratingCount verification categories")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Vendor.countDocuments(query),
  ]);

  return ok({ vendors, meta: buildMeta({ page, limit, total }) });
}
