import { connectDB } from "@/lib/db/connect";
import Notification from "@/models/Notification";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, getPagination, buildMeta } from "@/lib/utils/api";

export async function GET(request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams, { defaultLimit: 30 });

    await connectDB();
    const query = { recipient: user._id };
    if (searchParams.get("unread") === "true") query.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: user._id, isRead: false }),
    ]);

    return ok({ notifications, unreadCount, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}

// PUT { markAllRead: true } or { ids: [...] }
export async function PUT(request) {
  try {
    const user = await requireUser();
    const body = await request.json();

    await connectDB();
    if (body.markAllRead) {
      await Notification.updateMany({ recipient: user._id, isRead: false }, { $set: { isRead: true } });
    } else if (Array.isArray(body.ids)) {
      await Notification.updateMany({ _id: { $in: body.ids }, recipient: user._id }, { $set: { isRead: true } });
    }
    return ok({ updated: true });
  } catch (err) {
    return handleApiError(err);
  }
}
