import { connectDB } from "@/lib/db/connect";
import Conversation from "@/models/Conversation";
import Vendor from "@/models/Vendor";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

// GET: list the current user's conversations (buyer or vendor side).
export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();

    const query = user.role === "vendor" ? { vendor: user.vendor } : { buyer: user._id };
    const conversations = await Conversation.find(query)
      .populate("buyer", "name")
      .populate("vendor", "businessName slug logo")
      .populate("product", "name slug images")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    return ok({ conversations });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST: buyer opens (or resumes) a chat with a vendor, optionally about a product.
export async function POST(request) {
  try {
    const user = await requireUser(["buyer"]);
    const { vendorId, productId } = await request.json();
    if (!vendorId) return fail("vendorId is required");

    await connectDB();
    const vendor = await Vendor.findOne({ _id: vendorId, status: "approved" });
    if (!vendor) throw new ApiError(404, "Supplier not found");

    let conversation = await Conversation.findOne({ buyer: user._id, vendor: vendor._id, product: productId || null });
    if (!conversation) {
      conversation = await Conversation.create({ buyer: user._id, vendor: vendor._id, product: productId || undefined });
    }

    return ok({ conversation }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
