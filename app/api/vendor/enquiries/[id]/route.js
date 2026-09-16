import { connectDB } from "@/lib/db/connect";
import Enquiry from "@/models/Enquiry";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";
import { annotateEnquiriesWithPlanLimit } from "@/lib/utils/leadAccess";

export async function PUT(request, { params }) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const update = {};
    if (body.status) update.status = body.status;
    if (body.followUpDate) update.followUpDate = body.followUpDate;
    if (body.note) {
      update.$push = { notes: { text: body.note, by: user._id } };
    }

    const { $push, ...set } = update;
    const enquiry = await Enquiry.findOneAndUpdate(
      { _id: id, vendor: vendor._id },
      { ...(Object.keys(set).length ? { $set: set } : {}), ...($push ? { $push } : {}) },
      { new: true }
    );
    if (!enquiry) throw new ApiError(404, "Enquiry not found");
    const { enquiries: [annotated] } = await annotateEnquiriesWithPlanLimit(vendor, [enquiry.toObject()]);
    return ok({ enquiry: annotated });
  } catch (err) {
    return handleApiError(err);
  }
}
