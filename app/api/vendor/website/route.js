import { connectDB } from "@/lib/db/connect";
import Website from "@/models/Website";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

// Website builder settings for the vendor's own auto-generated mini site
// (spec section 12). Publishing only flips the flag if the vendor is approved.
export async function GET() {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    await connectDB();
    const website = await Website.findOne({ vendor: vendor._id }).lean();
    if (!website) throw new ApiError(404, "Website not found");
    return ok({ website });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const body = await request.json();

    await connectDB();
    const allowedFields = ["template", "theme", "favicon", "tagline", "aboutContent", "whyChooseUs", "testimonials", "contact", "seo"];
    const set = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) set[field] = body[field];
    }

    if (body.publish) {
      if (vendor.status !== "approved") {
        throw new ApiError(403, "Your business must be approved before the website can go live");
      }
      set.status = "live";
      set.publishedAt = new Date();
    }

    const website = await Website.findOneAndUpdate({ vendor: vendor._id }, { $set: set }, { new: true });
    if (!website) throw new ApiError(404, "Website not found");
    return ok({ website });
  } catch (err) {
    return handleApiError(err);
  }
}
