import { connectDB } from "@/lib/db/connect";
import RFQ from "@/models/RFQ";
import Vendor from "@/models/Vendor";
import Notification from "@/models/Notification";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { getCurrentUser } from "@/lib/auth/session";
import { ok, fail, getPagination, buildMeta, stripEmptyRefs } from "@/lib/utils/api";
import { rateLimitAsync, clientIpFromRequest } from "@/lib/utils/rateLimit";

// GET: open buyer requirements feed (spec: "Buyer Requirements" homepage section,
// and vendors browsing RFQs relevant to their category). ?mine=true scopes it
// to the logged-in buyer's own requirements regardless of status.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  await connectDB();

  const { page, limit, skip } = getPagination(searchParams);
  const query = {};

  if (searchParams.get("mine") === "true") {
    const user = await getCurrentUser();
    if (!user) return fail("Authentication required", 401);
    query.buyer = user._id;
  } else if (searchParams.get("status")) {
    query.status = searchParams.get("status");
  } else {
    query.status = "open";
  }
  if (searchParams.get("category")) query.category = searchParams.get("category");

  const [rfqs, total] = await Promise.all([
    RFQ.find(query).populate("buyer", "name").populate("category", "name slug").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    RFQ.countDocuments(query),
  ]);

  return ok({ rfqs, meta: buildMeta({ page, limit, total }) });
}

// POST: buyer posts a buying requirement (spec section 16). Matching vendors
// (same category + optionally same city) are notified.
export async function POST(request) {
  try {
    const user = await requireUser(["buyer"]);
    // Each RFQ fans out a notification to every matching vendor, so this is
    // rate-limited per-user (not just per-IP) to stop one account from mass-spamming.
    const { allowed } = await rateLimitAsync(`rfq:${user._id}`, { limit: 10, windowMs: 60_000 });
    if (!allowed) return fail("Too many requirements posted. Please try again shortly.", 429);

    const body = stripEmptyRefs(await request.json(), ["category"]);
    if (!body?.title) return fail("Requirement title is required");

    await connectDB();
    const rfq = await RFQ.create({ ...body, buyer: user._id });

    const vendorQuery = { status: "approved" };
    if (body.category) vendorQuery.categories = body.category;
    const vendors = await Vendor.find(vendorQuery).select("_id owner").limit(200).lean();

    if (vendors.length) {
      rfq.notifiedVendors = vendors.map((v) => v._id);
      await rfq.save();

      await Notification.insertMany(
        vendors.map((v) => ({
          recipient: v.owner,
          vendor: v._id,
          type: "rfq_received",
          title: "New buying requirement",
          body: rfq.title,
          link: "/dashboard/rfqs",
          meta: { rfqId: rfq._id },
        }))
      );
    }

    return ok({ rfq }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
