import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import Website from "@/models/Website";
import Product from "@/models/Product";
import Service from "@/models/Service";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import Notification from "@/models/Notification";
import AuditLog from "@/models/AuditLog";
import { requireUser, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

const ACTIONS = ["approve", "reject", "suspend", "activate"];

// This is where the "automatic website creation flow" (spec section 40)
// actually goes live: approving a vendor here flips their Website from
// draft -> live, so the subdomain starts resolving publicly.
export async function PUT(request, { params }) {
  try {
    const admin = await requireUser(["admin", "superadmin"]);
    const { id } = await params;
    const { action, rejectionReason, template } = await request.json();

    if (!ACTIONS.includes(action)) return fail("Invalid action");

    await connectDB();
    const vendor = await Vendor.findById(id);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    if (action === "approve") {
      vendor.status = "approved";
      vendor.verification.status = "verified";
      vendor.verification.reviewedBy = admin._id;
      vendor.verification.reviewedAt = new Date();
      if (!vendor.verification.badges.includes("business_verified")) {
        vendor.verification.badges.push("business_verified");
      }
      await vendor.save();

      await Website.findOneAndUpdate(
        { vendor: vendor._id },
        { $set: { status: "live", publishedAt: new Date(), ...(template ? { template } : {}) } }
      );

      await Notification.create({
        recipient: vendor.owner,
        vendor: vendor._id,
        type: "verification_approved",
        title: "Your business has been approved",
        body: "Your profile and website are now live on the marketplace.",
        link: "/dashboard",
      });
    } else if (action === "reject") {
      vendor.status = "rejected";
      vendor.verification.status = "rejected";
      vendor.verification.rejectionReason = rejectionReason;
      await vendor.save();

      await Notification.create({
        recipient: vendor.owner,
        vendor: vendor._id,
        type: "verification_rejected",
        title: "Your business application was rejected",
        body: rejectionReason || "Please review your submitted documents and try again.",
        link: "/dashboard",
      });
    } else if (action === "suspend") {
      vendor.status = "suspended";
      await vendor.save();
      await Website.updateOne({ vendor: vendor._id }, { $set: { status: "suspended" } });
    } else if (action === "activate") {
      vendor.status = "approved";
      await vendor.save();
      await Website.updateOne({ vendor: vendor._id }, { $set: { status: "live" } });
    }

    await AuditLog.create({
      actor: admin._id,
      actorRole: admin.role,
      action: `vendor.${action}`,
      targetType: "Vendor",
      targetId: vendor._id,
    });

    return ok({ vendor });
  } catch (err) {
    return handleApiError(err);
  }
}

// Permanently removes a vendor's storefront (business profile, products,
// services, website, subscription) — superadmin-only, since unlike
// suspend/reject this can't be undone. The owning user account is kept but
// demoted back to a plain buyer rather than deleted, so a mistaken delete
// doesn't lock someone out of their login entirely. Reviews/leads/enquiries
// tied to the vendor are left as historical records rather than cascaded,
// since that data belongs to the buyers who created it, not the vendor.
export async function DELETE(request, { params }) {
  try {
    const admin = await requireUser(["superadmin"]);
    const { id } = await params;

    await connectDB();
    const vendor = await Vendor.findById(id);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    await Promise.all([
      Product.deleteMany({ vendor: vendor._id }),
      Service.deleteMany({ vendor: vendor._id }),
      Website.deleteMany({ vendor: vendor._id }),
      Subscription.deleteMany({ vendor: vendor._id }),
      User.updateOne({ _id: vendor.owner }, { $set: { role: "buyer" }, $unset: { vendor: 1 } }),
    ]);

    await Vendor.deleteOne({ _id: vendor._id });

    await AuditLog.create({
      actor: admin._id,
      actorRole: admin.role,
      action: "vendor.deleted",
      targetType: "Vendor",
      targetId: vendor._id,
      metadata: { businessName: vendor.businessName },
    });

    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
