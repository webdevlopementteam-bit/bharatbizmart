import { connectDB } from "@/lib/db/connect";
import Review from "@/models/Review";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

const ALLOWED = ["pending", "approved", "rejected", "reported"];

export async function PUT(request, { params }) {
  try {
    await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    const { status } = await request.json();
    if (!ALLOWED.includes(status)) return fail("Invalid status");

    await connectDB();
    const review = await Review.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!review) throw new ApiError(404, "Review not found");
    return ok({ review });
  } catch (err) {
    return handleApiError(err);
  }
}
