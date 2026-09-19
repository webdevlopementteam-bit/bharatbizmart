import { connectDB } from "@/lib/db/connect";
import Advertisement from "@/models/Advertisement";
import Payment from "@/models/Payment";
import Product from "@/models/Product";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";
import { getAdPackage } from "@/lib/utils/adPackages";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/payments/razorpay";
import { activateAdvertisement } from "@/lib/payments/activateAdvertisement";

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
 * TradeIndia Super Seller style upsell). With a Razorpay key configured this
 * creates a real order for the client to pay via checkout, and the
 * promotion only goes live once /verify confirms the payment; without a key
 * configured it still activates immediately so the feature stays testable.
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

    if (!isRazorpayConfigured()) {
      const payment = await Payment.create({
        vendor: vendor._id,
        amount: pkg.price,
        provider: "manual",
        status: "success",
        purpose: "advertisement",
        meta: { packageKey, productId },
      });
      const ad = await activateAdvertisement({ vendor, pkg, productId });
      return ok({ activated: true, ad, payment }, { status: 201 });
    }

    const payment = await Payment.create({
      vendor: vendor._id,
      amount: pkg.price,
      provider: "razorpay",
      status: "created",
      purpose: "advertisement",
      meta: { packageKey, productId },
    });

    const order = await createRazorpayOrder({
      amountInRupees: pkg.price,
      receipt: `ad_${payment._id}`,
      notes: { vendorId: String(vendor._id), packageKey, paymentId: String(payment._id) },
    });

    payment.providerOrderId = order.id;
    await payment.save();

    return ok({
      requiresPayment: true,
      paymentId: String(payment._id),
      order: { id: order.id, amount: order.amount, currency: order.currency },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
