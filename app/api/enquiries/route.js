import { connectDB } from "@/lib/db/connect";
import Enquiry from "@/models/Enquiry";
import Lead from "@/models/Lead";
import Notification from "@/models/Notification";
import Vendor from "@/models/Vendor";
import { getCurrentUser } from "@/lib/auth/session";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok, fail, getPagination, buildMeta } from "@/lib/utils/api";
import { rateLimitAsync, clientIpFromRequest } from "@/lib/utils/rateLimit";

// GET: a logged-in buyer's own enquiry history.
export async function GET(request) {
  try {
    const user = await requireUser(["buyer"]);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);

    await connectDB();
    const query = { buyer: user._id };
    const [enquiries, total] = await Promise.all([
      Enquiry.find(query).populate("vendor", "businessName slug logo").populate("product", "name slug").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Enquiry.countDocuments(query),
    ]);

    return ok({ enquiries, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}

// "Get Best Price" / enquiry form (spec section 15). Works for logged-in
// buyers and guests alike; the vendor is always taken from the request body
// vendor id but cross-checked to exist & be approved before anything is written.
export async function POST(request) {
  const { allowed } = await rateLimitAsync(`enquiry:${clientIpFromRequest(request)}`, { limit: 20, windowMs: 60_000 });
  if (!allowed) return fail("Too many enquiries sent. Please try again shortly.", 429);

  const body = await request.json();
  const { vendorId, productId, name, mobile, email, quantity, requirement, deliveryLocation, message, source } = body || {};

  if (!vendorId || !name || !mobile) return fail("Vendor, name and mobile number are required");

  await connectDB();
  const vendor = await Vendor.findOne({ _id: vendorId, status: "approved" });
  if (!vendor) return fail("Supplier not found", 404);

  const user = await getCurrentUser();

  const enquiry = await Enquiry.create({
    vendor: vendor._id,
    product: productId || undefined,
    buyer: user?._id,
    name,
    mobile,
    email,
    quantity,
    requirement,
    deliveryLocation,
    message,
    source: source || "product_page",
  });

  const lead = await Lead.create({
    vendor: vendor._id,
    buyerName: name,
    phone: mobile,
    email,
    product: productId || undefined,
    requirement: requirement || message,
    quantity,
    location: deliveryLocation,
    source: "enquiry",
    sourceRef: enquiry._id,
    sourceRefModel: "Enquiry",
  });

  await Vendor.updateOne(
    { _id: vendor._id },
    { $inc: { "analytics.enquiriesCount": 1, "analytics.leadsCount": 1 } }
  );

  await Notification.create({
    recipient: vendor.owner,
    vendor: vendor._id,
    type: "new_enquiry",
    title: "New enquiry received",
    body: `${name} sent an enquiry${requirement ? `: ${requirement}` : ""}`,
    link: "/dashboard/enquiries",
    meta: { enquiryId: enquiry._id, leadId: lead._id },
  });

  return ok({ enquiry: { id: enquiry._id } }, { status: 201 });
}
