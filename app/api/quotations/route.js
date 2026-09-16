import { connectDB } from "@/lib/db/connect";
import Quotation from "@/models/Quotation";
import RFQ from "@/models/RFQ";
import Notification from "@/models/Notification";
import { requireUser, requireVendorContext, handleApiError } from "@/lib/auth/guard";
import { ok, fail, getPagination, buildMeta } from "@/lib/utils/api";

// GET: buyer sees quotations addressed to them; vendor sees quotations they sent.
export async function GET(request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    await connectDB();

    const query = user.role === "vendor" ? { vendor: user.vendor } : { buyer: user._id };
    const [quotations, total] = await Promise.all([
      Quotation.find(query).populate("product", "name slug").populate("vendor", "businessName slug logo").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Quotation.countDocuments(query),
    ]);

    return ok({ quotations, meta: buildMeta({ page, limit, total }) });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST: vendor sends a quotation in response to an RFQ or enquiry (spec section 17).
export async function POST(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const body = await request.json();

    if (!body?.quantity || !body?.unitPrice) return fail("Quantity and unit price are required");

    await connectDB();
    const quotation = await Quotation.create({ ...body, vendor: vendor._id });

    if (body.rfq) {
      const rfq = await RFQ.findByIdAndUpdate(body.rfq, { $addToSet: { quotations: quotation._id } }, { new: true });
      if (rfq) {
        await Notification.create({
          recipient: rfq.buyer,
          type: "quotation_received",
          title: `New quotation for "${rfq.title}"`,
          body: `${vendor.businessName} sent you a quotation`,
          link: "/account/rfqs",
          meta: { rfqId: rfq._id, quotationId: quotation._id },
        });
      }
    } else if (body.buyer) {
      await Notification.create({
        recipient: body.buyer,
        type: "quotation_received",
        title: "New quotation received",
        body: `${vendor.businessName} sent you a quotation`,
        link: "/account/quotations",
        meta: { quotationId: quotation._id },
      });
    }

    return ok({ quotation }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
