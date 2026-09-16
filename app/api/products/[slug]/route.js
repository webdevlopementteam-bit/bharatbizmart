import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import { ok, fail } from "@/lib/utils/api";

export async function GET(request, { params }) {
  const { slug } = await params;
  await connectDB();

  const product = await Product.findOne({ slug, status: "active" })
    .populate("vendor")
    .populate("category", "name slug")
    .lean();
  if (!product) return fail("Product not found", 404);

  Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).catch(() => {});

  const [similarProducts, otherVendorProducts] = await Promise.all([
    Product.find({ category: product.category?._id, status: "active", _id: { $ne: product._id } })
      .limit(8)
      .select("name slug images price moq vendor")
      .populate("vendor", "businessName slug city")
      .lean(),
    Product.find({ vendor: product.vendor?._id, status: "active", _id: { $ne: product._id } })
      .limit(8)
      .select("name slug images price moq")
      .lean(),
  ]);

  return ok({ product, similarProducts, otherVendorProducts });
}
