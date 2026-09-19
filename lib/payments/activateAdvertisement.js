import Advertisement from "@/models/Advertisement";
import Product from "@/models/Product";

/**
 * Actually creates the Advertisement (and flips isFeatured for a promoted
 * product) — called either immediately (no Razorpay key configured) or from
 * /api/vendor/advertisements/verify once a real payment has checked out.
 */
export async function activateAdvertisement({ vendor, pkg, productId }) {
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

  return ad;
}
