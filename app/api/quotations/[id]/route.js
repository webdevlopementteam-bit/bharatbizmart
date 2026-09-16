import { connectDB } from "@/lib/db/connect";
import Quotation from "@/models/Quotation";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

// Buyer accepts/rejects/negotiates a quotation sent to them.
export async function PUT(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { status } = await request.json();

    if (!["accepted", "rejected", "negotiating"].includes(status)) return fail("Invalid status");

    await connectDB();
    const filter = user.role === "vendor" ? { _id: id, vendor: user.vendor } : { _id: id, buyer: user._id };
    const quotation = await Quotation.findOneAndUpdate(filter, { $set: { status } }, { new: true });
    if (!quotation) throw new ApiError(404, "Quotation not found");
    return ok({ quotation });
  } catch (err) {
    return handleApiError(err);
  }
}
