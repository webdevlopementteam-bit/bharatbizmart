import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await requireUser(["buyer"]);
    await connectDB();
    const me = await User.findById(user._id).populate("savedProducts").lean();
    return ok({ savedProducts: me?.savedProducts || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser(["buyer"]);
    const { productId } = await request.json();
    if (!productId) return fail("productId is required");

    await connectDB();
    await User.updateOne({ _id: user._id }, { $addToSet: { savedProducts: productId } });
    return ok({ saved: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request) {
  try {
    const user = await requireUser(["buyer"]);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    await connectDB();
    await User.updateOne({ _id: user._id }, { $pull: { savedProducts: productId } });
    return ok({ removed: true });
  } catch (err) {
    return handleApiError(err);
  }
}
