import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { ok, fail } from "@/lib/utils/api";

export async function GET(request, { params }) {
  const { slug } = await params;
  await connectDB();

  const vendor = await Vendor.findOne({ slug, status: "approved" })
    .populate("categories", "name slug")
    .lean();
  if (!vendor) return fail("Supplier not found", 404);

  Vendor.updateOne({ _id: vendor._id }, { $inc: { "analytics.profileViews": 1 } }).catch(() => {});

  const [products, reviews] = await Promise.all([
    Product.find({ vendor: vendor._id, status: "active" }).sort({ createdAt: -1 }).limit(24).lean(),
    Review.find({ vendor: vendor._id, status: "approved" }).sort({ createdAt: -1 }).limit(10).populate("buyer", "name").lean(),
  ]);

  return ok({ vendor, products, reviews });
}
