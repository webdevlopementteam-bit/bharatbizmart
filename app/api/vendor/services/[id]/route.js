import { connectDB } from "@/lib/db/connect";
import Service from "@/models/Service";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, stripEmptyRefs, pickFields } from "@/lib/utils/api";

const EDITABLE_FIELDS = ["name", "images", "category", "description", "priceRange", "features", "status", "seo"];

export async function PUT(request, { params }) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { id } = await params;
    const body = stripEmptyRefs(pickFields(await request.json(), EDITABLE_FIELDS), ["category"]);

    await connectDB();
    const service = await Service.findOneAndUpdate(
      { _id: id, vendor: vendor._id },
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!service) throw new ApiError(404, "Service not found");
    return ok({ service });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { id } = await params;

    await connectDB();
    const result = await Service.deleteOne({ _id: id, vendor: vendor._id });
    if (!result.deletedCount) throw new ApiError(404, "Service not found");
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
