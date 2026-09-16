import { connectDB } from "@/lib/db/connect";
import Advertisement from "@/models/Advertisement";
import Payment from "@/models/Payment";
import Product from "@/models/Product";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";
import { getAdPackage } from "@/lib/utils/adPackages";

export async function GET() {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    await connectDB();
    const ads = await Advertisement.find({ vendor: vendor._id }).populate("product", "name slug").sort({ createdAt: -1 }).lean();
    return ok({ ads });
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * Self-serve "Promote my business" purchase (IndiaMART Star Supplier /
 * TradeIndia Super Seller style upsell). Same demo-payment pattern as
 * subscription upgrades: activates immediately and records a real Payment,
 * with the Razorpay checkout redirect being the one piece that needs a live
 * key to go further (see /api/vendor/subscription for the identical note).
 */
export async function POST(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { packageKey, productId } = await request.json();

    const pkg = getAdPackage(packageKey);
    if (!pkg) return fail("Invalid promotion package");
    if (pkg.requiresProduct && !productId) return fail("Select a product to promote");

    await connectDB();

    if (productId) {
      const product = await Product.findOne({ _id: productId, vendor: vendor._id });
      if (!product) throw new ApiError(404, "Product not found");
    }

    const payment = await Payment.create({
      vendor: vendor._id,
      amount: pkg.price,
      provider: process.env.RAZORPAY_KEY_ID ? "razorpay" : "manual",
      status: "success",
      purpose: "advertisement",
    });

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + pkg.durationDays * 24 * 60 * 60 * 1000);

    const ad = await Advertisement.create({
      vendor: vendor._id,
      type: pkg.type,
      title: pkg.name,
      product: productId || undefined,
      startDate,
      endDate,
      status: "active",
    });

    if (pkg.type === "featured_product" && productId) {
      await Product.updateOne({ _id: productId }, { $set: { isFeatured: true } });
    }

    return ok({ ad, payment }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
