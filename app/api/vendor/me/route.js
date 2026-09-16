import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import { requireUser, requireVendorContext, handleApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

const EDITABLE_FIELDS = [
  "businessName", "logo", "coverImage", "gallery", "description", "tagline",
  "businessType", "establishedYear", "address", "city", "state", "country", "pincode",
  "email", "phone", "whatsapp", "social", "categories", "branches",
];

export async function GET() {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    return ok({ vendor });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const body = await request.json();

    const set = {};
    for (const field of EDITABLE_FIELDS) {
      if (body[field] !== undefined) set[field] = body[field];
    }

    await connectDB();
    const updated = await Vendor.findByIdAndUpdate(vendor._id, { $set: set }, { new: true, runValidators: true });
    return ok({ vendor: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
