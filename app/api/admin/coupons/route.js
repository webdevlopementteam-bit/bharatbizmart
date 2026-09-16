import { connectDB } from "@/lib/db/connect";
import Coupon from "@/models/Coupon";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireUser(["admin", "superadmin"]);
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return ok({ coupons });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    await requireUser(["admin", "superadmin"]);
    const body = await request.json();
    if (!body?.code || !body?.discountValue) return fail("Code and discount value are required");

    await connectDB();
    const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
    if (existing) return fail("A coupon with this code already exists", 409);

    const coupon = await Coupon.create({ ...body, code: body.code.toUpperCase() });
    return ok({ coupon }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
