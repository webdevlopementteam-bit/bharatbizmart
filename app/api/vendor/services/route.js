import { connectDB } from "@/lib/db/connect";
import Service from "@/models/Service";
import { requireUser, requireVendorContext, handleApiError } from "@/lib/auth/guard";
import { generateUniqueSlug } from "@/lib/utils/slug";
import { ok, fail, stripEmptyRefs, pickFields } from "@/lib/utils/api";

const EDITABLE_FIELDS = ["name", "images", "category", "description", "priceRange", "features", "status", "seo"];

export async function GET() {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    await connectDB();
    const services = await Service.find({ vendor: vendor._id }).sort({ createdAt: -1 }).lean();
    return ok({ services });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const body = stripEmptyRefs(pickFields(await request.json(), EDITABLE_FIELDS), ["category"]);
    if (!body?.name) return fail("Service name is required");

    await connectDB();
    const slug = await generateUniqueSlug(Service, body.name, { suffixHint: vendor.slug });
    const service = await Service.create({ ...body, vendor: vendor._id, slug });
    return ok({ service }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
