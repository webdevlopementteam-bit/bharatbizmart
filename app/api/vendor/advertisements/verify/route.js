import { connectDB } from "@/lib/db/connect";
import Payment from "@/models/Payment";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { getAdPackage } from "@/lib/utils/adPackages";
import { activateAdvertisement } from "@/lib/payments/activateAdvertisement";

export async function POST(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { paymentId, razorpay_payment_id: razorpayPaymentId, razorpay_order_id: razorpayOrderId, razorpay_signature: razorpaySignature } =
      await request.json();

    if (!paymentId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return fail("Missing payment confirmation fields");
    }

    await connectDB();
    const payment = await Payment.findOne({ _id: paymentId, vendor: vendor._id, purpose: "advertisement" });
    if (!payment) throw new ApiError(404, "Payment not found");
    if (payment.status === "success") return ok({ activated: true });
    if (payment.providerOrderId !== razorpayOrderId) throw new ApiError(400, "Order mismatch");

    const validSignature = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });
    if (!validSignature) {
      payment.status = "failed";
      await payment.save();
      throw new ApiError(400, "Payment verification failed");
    }

    const { packageKey, productId } = payment.meta || {};
    const pkg = getAdPackage(packageKey);
    if (!pkg) throw new ApiError(404, "Promotion package not found");

    payment.status = "success";
    payment.providerPaymentId = razorpayPaymentId;
    await payment.save();

    const ad = await activateAdvertisement({ vendor, pkg, productId });
    return ok({ activated: true, ad });
  } catch (err) {
    return handleApiError(err);
  }
}
