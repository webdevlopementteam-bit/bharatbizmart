import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, stripEmptyRefs, pickFields } from "@/lib/utils/api";

// Explicitly excludes vendor, isFeatured, viewCount, enquiryCount, slug —
// a vendor edits their own listing content, not its ownership, paid
// placement, or analytics counters.
const EDITABLE_FIELDS = [
  "name", "images", "category", "subCategory", "price", "moq", "moqUnit", "priceTiers",
  "description", "specifications", "features", "applications", "packagingDetails",
  "deliveryDetails", "paymentTerms", "availability", "deliveryLocations", "tags", "status", "seo",
];

// Every handler re-checks `vendor: vendor._id` on the filter — this is what
// enforces tenant isolation: a vendor can never touch another vendor's product
// even if it guesses the product id.
async function loadOwnedProduct(vendor, id) {
  await connectDB();
  const product = await Product.findOne({ _id: id, vendor: vendor._id });
  if (!product) throw new ApiError(404, "Product not found");
  return product;
}

export async function GET(request, { params }) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { id } = await params;
    const product = await loadOwnedProduct(vendor, id);
    return ok({ product });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { id } = await params;
    const body = stripEmptyRefs(pickFields(await request.json(), EDITABLE_FIELDS), ["category", "subCategory"]);

    await loadOwnedProduct(vendor, id);
    const product = await Product.findOneAndUpdate(
      { _id: id, vendor: vendor._id },
      { $set: body },
      { new: true, runValidators: true }
    );
    return ok({ product });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { id } = await params;

    await loadOwnedProduct(vendor, id);
    await Product.deleteOne({ _id: id, vendor: vendor._id });
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
