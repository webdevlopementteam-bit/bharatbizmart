import { connectDB } from "@/lib/db/connect";
import SupportTicket from "@/models/SupportTicket";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

async function loadOwnedTicket(user, id) {
  await connectDB();
  const isStaff = ["admin", "superadmin"].includes(user.role);
  const filter = isStaff ? { _id: id } : { _id: id, user: user._id };
  const ticket = await SupportTicket.findOne(filter).populate("user", "name email role");
  if (!ticket) throw new ApiError(404, "Ticket not found");
  return { ticket, isStaff };
}

export async function GET(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { ticket } = await loadOwnedTicket(user, id);
    return ok({ ticket });
  } catch (err) {
    return handleApiError(err);
  }
}

// Reply into a ticket thread — works for the ticket owner and for staff.
export async function POST(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const { text } = await request.json();
    if (!text) return fail("Reply text is required");

    const { ticket, isStaff } = await loadOwnedTicket(user, id);
    ticket.replies.push({ text, by: user._id, isStaff });
    if (isStaff && ticket.status === "open") ticket.status = "in_progress";
    await ticket.save();

    return ok({ ticket }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

// Staff-only status change (resolve/close a ticket).
export async function PUT(request, { params }) {
  try {
    const user = await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    const { status } = await request.json();
    if (!["open", "in_progress", "resolved", "closed"].includes(status)) return fail("Invalid status");

    await connectDB();
    const ticket = await SupportTicket.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!ticket) throw new ApiError(404, "Ticket not found");
    return ok({ ticket });
  } catch (err) {
    return handleApiError(err);
  }
}
