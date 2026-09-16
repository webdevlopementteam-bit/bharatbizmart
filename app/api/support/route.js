import { connectDB } from "@/lib/db/connect";
import SupportTicket from "@/models/SupportTicket";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

// Any authenticated user (buyer or vendor) can raise/view their own support tickets.
export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();
    const tickets = await SupportTicket.find({ user: user._id }).sort({ createdAt: -1 }).lean();
    return ok({ tickets });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    if (!body?.subject || !body?.description) return fail("Subject and description are required");

    await connectDB();
    const ticket = await SupportTicket.create({
      user: user._id,
      vendor: user.vendor || undefined,
      subject: body.subject,
      category: body.category || "other",
      description: body.description,
      priority: body.priority || "medium",
    });

    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } }).select("_id").lean();
    if (admins.length) {
      await Notification.insertMany(
        admins.map((a) => ({
          recipient: a._id,
          type: "system",
          title: "New support ticket",
          body: `${user.name}: ${body.subject}`,
          link: `/admin/support/${ticket._id}`,
        }))
      );
    }

    return ok({ ticket }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
