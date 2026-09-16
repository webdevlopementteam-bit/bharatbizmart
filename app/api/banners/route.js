import { connectDB } from "@/lib/db/connect";
import Banner from "@/models/Banner";
import { ok } from "@/lib/utils/api";

// Public — homepage/category banners managed entirely from the admin CMS (spec section 27).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  await connectDB();

  const query = { status: "active" };
  if (searchParams.get("placement")) query.placement = searchParams.get("placement");

  const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 }).lean();
  return ok({ banners });
}
