import { connectDB } from "@/lib/db/connect";
import Banner from "@/models/Banner";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireUser(["admin", "superadmin"]);
    await connectDB();
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 }).lean();
    return ok({ banners });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    await requireUser(["admin", "superadmin"]);
    const body = await request.json();
    if (!body?.title || !body?.image) return fail("Title and image are required");

    await connectDB();
    const banner = await Banner.create(body);
    return ok({ banner }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
