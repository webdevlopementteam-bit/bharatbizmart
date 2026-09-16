import { connectDB } from "@/lib/db/connect";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { ok } from "@/lib/utils/api";

export async function GET() {
  await connectDB();
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ order: 1 }).lean();
  return ok({ plans });
}
