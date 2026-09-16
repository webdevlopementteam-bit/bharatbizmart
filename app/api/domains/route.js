import { connectDB } from "@/lib/db/connect";
import Domain from "@/models/Domain";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import Subscription from "@/models/Subscription";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";
import { nanoid } from "nanoid";
import { ROOT_DOMAIN } from "@/lib/tenant/resolveTenant";

// Premium-plan custom domain connection (spec section 11).
export async function GET() {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    await connectDB();
    const domains = await Domain.find({ vendor: vendor._id }).lean();
    return ok({ domains, cnameTarget: `sites.${ROOT_DOMAIN}` });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { hostname } = await request.json();
    if (!hostname) return fail("Domain hostname is required");

    await connectDB();
    const subscription = await Subscription.findOne({ vendor: vendor._id, status: "active" });
    const plan = await SubscriptionPlan.findOne({ key: subscription?.planKey || vendor.subscriptionPlan || "free" });
    if (!plan?.limits?.customDomain) {
      throw new ApiError(403, "Custom domains require the Premium plan or higher. Please upgrade your subscription.");
    }

    const existing = await Domain.findOne({ hostname: hostname.toLowerCase() });
    if (existing) return fail("This domain is already connected to another account", 409);

    const domain = await Domain.create({
      vendor: vendor._id,
      hostname: hostname.toLowerCase(),
      verificationToken: nanoid(24),
      cnameTarget: `sites.${ROOT_DOMAIN}`,
      status: "pending_dns",
    });

    return ok(
      {
        domain,
        instructions: {
          type: "CNAME",
          host: hostname,
          value: `sites.${ROOT_DOMAIN}`,
          note: "Add this CNAME record at your DNS provider, then click Verify. SSL is issued automatically once DNS is verified.",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
