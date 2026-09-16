import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await requireUser();
    await connectDB();
    const me = await User.findById(user._id).select("addresses").lean();
    return ok({ addresses: me?.addresses || [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser();
    const address = await request.json();
    if (!address?.line1 || !address?.city) return fail("Address line and city are required");

    await connectDB();
    await User.updateOne({ _id: user._id }, { $push: { addresses: address } });
    const me = await User.findById(user._id).select("addresses").lean();
    return ok({ addresses: me.addresses }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");

    await connectDB();
    await User.updateOne({ _id: user._id }, { $pull: { addresses: { _id: addressId } } });
    return ok({ removed: true });
  } catch (err) {
    return handleApiError(err);
  }
}
