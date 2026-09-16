import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await requireUser(["buyer"]);
    await connectDB();
    const me = await User.findById(user._id).populate("savedVendors").lean();
    return ok({ savedVendors: me?.savedVendors || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser(["buyer"]);
    const { vendorId } = await request.json();
    if (!vendorId) return fail("vendorId is required");

    await connectDB();
    await User.updateOne({ _id: user._id }, { $addToSet: { savedVendors: vendorId } });
    return ok({ saved: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request) {
  try {
    const user = await requireUser(["buyer"]);
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    await connectDB();
    await User.updateOne({ _id: user._id }, { $pull: { savedVendors: vendorId } });
    return ok({ removed: true });
  } catch (err) {
    return handleApiError(err);
  }
}
