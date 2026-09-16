import { connectDB } from "@/lib/db/connect";
import Location from "@/models/Location";
import { ok } from "@/lib/utils/api";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  await connectDB();

  const query = {};
  if (searchParams.get("popular") === "true") query.isPopular = true;
  const q = searchParams.get("q");
  if (q) query.$text = { $search: q };

  const locations = await Location.find(query).sort({ vendorCount: -1 }).limit(50).lean();
  return ok({ locations });
}
