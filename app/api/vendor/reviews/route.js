import { connectDB } from "@/lib/db/connect";
import Review from "@/models/Review";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, getPagination, buildMeta } from "@/lib/utils/api";

export async function GET(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);

    await connectDB();
    const [reviews, total] = await Promise.all([
      Review.find({ vendor: vendor._id }).populate("buyer", "name").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments({ vendor: vendor._id }),
    ]);

    return ok({ reviews, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}

// PUT ?id= — vendor replies to, or reports, a review left on their profile.
export async function PUT(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    await connectDB();
    const set = {};
    if (body.reply) set.vendorReply = { text: body.reply, repliedAt: new Date() };
    if (body.report) {
      set.status = "reported";
      set.reportReason = body.reportReason;
    }

    const review = await Review.findOneAndUpdate({ _id: id, vendor: vendor._id }, { $set: set }, { new: true });
    if (!review) throw new ApiError(404, "Review not found");
    return ok({ review });
  } catch (err) {
    return handleApiError(err);
  }
}
