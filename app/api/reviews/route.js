import { connectDB } from "@/lib/db/connect";
import Review from "@/models/Review";
import Vendor from "@/models/Vendor";
import Notification from "@/models/Notification";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, fail, getPagination, buildMeta } from "@/lib/utils/api";
import { rateLimitAsync } from "@/lib/utils/rateLimit";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  await connectDB();

  const { page, limit, skip } = getPagination(searchParams);
  const query = { status: "approved" };
  if (searchParams.get("vendor")) query.vendor = searchParams.get("vendor");

  const [reviews, total] = await Promise.all([
    Review.find(query).populate("buyer", "name").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments(query),
  ]);

  return ok({ reviews, meta: buildMeta({ page, limit, total }) });
}

export async function POST(request) {
  try {
    const user = await requireUser(["buyer"]);
    const { allowed } = await rateLimitAsync(`review:${user._id}`, { limit: 10, windowMs: 60_000 });
    if (!allowed) return fail("Too many reviews submitted. Please try again shortly.", 429);

    const body = await request.json();
    if (!body?.vendor || !body?.rating) return fail("Vendor and rating are required");

    await connectDB();
    const review = await Review.create({ ...body, buyer: user._id });

    const stats = await Review.aggregate([
      { $match: { vendor: review.vendor, status: "approved" } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    if (stats[0]) {
      await Vendor.updateOne(
        { _id: review.vendor },
        { $set: { ratingAverage: Math.round(stats[0].avg * 10) / 10, ratingCount: stats[0].count } }
      );
    }

    const vendor = await Vendor.findById(review.vendor).select("owner businessName");
    if (vendor) {
      await Notification.create({
        recipient: vendor.owner,
        vendor: vendor._id,
        type: "review_received",
        title: "New review received",
        body: `You received a ${review.rating}-star review`,
        link: "/dashboard/reviews",
      });
    }

    return ok({ review }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
