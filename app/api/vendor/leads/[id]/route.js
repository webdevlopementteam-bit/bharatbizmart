import { connectDB } from "@/lib/db/connect";
import Lead from "@/models/Lead";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";
import { annotateLeadsWithPlanLimit } from "@/lib/utils/leadAccess";

export async function PUT(request, { params }) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { id } = await params;
    const body = await request.json();

    await connectDB();
    const set = {};
    const push = {};
    if (body.status) {
      set.status = body.status;
      push.activityTimeline = { action: `Status changed to ${body.status}`, by: user._id };
    }
    if (body.followUpDate) set.followUpDate = body.followUpDate;
    if (body.assignedTo) set.assignedTo = body.assignedTo;
    if (body.note) push.notes = { text: body.note, by: user._id };

    const lead = await Lead.findOneAndUpdate(
      { _id: id, vendor: vendor._id },
      { ...(Object.keys(set).length ? { $set: set } : {}), ...(Object.keys(push).length ? { $push: push } : {}) },
      { new: true }
    );
    if (!lead) throw new ApiError(404, "Lead not found");
    const { leads: [annotatedLead] } = await annotateLeadsWithPlanLimit(vendor, [lead.toObject()]);
    return ok({ lead: annotatedLead });
  } catch (err) {
    return handleApiError(err);
  }
}
