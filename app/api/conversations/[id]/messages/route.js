import { connectDB } from "@/lib/db/connect";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import Vendor from "@/models/Vendor";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

async function loadOwnedConversation(user, id) {
  await connectDB();
  const filter = user.role === "vendor" ? { _id: id, vendor: user.vendor } : { _id: id, buyer: user._id };
  const conversation = await Conversation.findOne(filter);
  if (!conversation) throw new ApiError(404, "Conversation not found");
  return conversation;
}

// Polling-based messaging (the architecture is Socket.IO-ready: swap this GET
// for a socket "message" event and the POST handler becomes the emit target).
export async function GET(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const conversation = await loadOwnedConversation(user, id);

    const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 }).lean();
    return ok({ conversation, messages });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const conversation = await loadOwnedConversation(user, id);
    const { text, attachments, sharedProduct, sharedRfq, sharedQuotation } = await request.json();

    if (!text && !attachments?.length) return fail("Message text or attachment is required");

    const senderType = user.role === "vendor" ? "vendor" : "buyer";
    const message = await Message.create({
      conversation: conversation._id,
      senderType,
      sender: user._id,
      text,
      attachments,
      sharedProduct,
      sharedRfq,
      sharedQuotation,
    });

    conversation.lastMessage = text || "Sent an attachment";
    conversation.lastMessageAt = new Date();
    if (senderType === "buyer") conversation.unreadByVendor += 1;
    else conversation.unreadByBuyer += 1;
    await conversation.save();

    if (senderType === "buyer") {
      const vendor = await Vendor.findById(conversation.vendor).select("owner");
      if (vendor) {
        await Notification.create({
          recipient: vendor.owner,
          vendor: vendor._id,
          type: "new_message",
          title: "New message received",
          body: text?.slice(0, 140),
          link: `/dashboard/messages/${conversation._id}`,
        });
      }
    }

    return ok({ message }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
