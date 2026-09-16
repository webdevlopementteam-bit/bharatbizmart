import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import Verification from "@/models/Verification";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { requireUser, requireVendorContext, handleApiError } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/utils/api";

// Vendor submits GST/PAN/registration documents for admin review (spec section 20).
export async function POST(request) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { documents } = await request.json();
    if (!documents?.length) return fail("At least one document is required");

    await connectDB();
    await Vendor.updateOne(
      { _id: vendor._id },
      { $push: { documents: { $each: documents } }, $set: { "verification.status": "pending" } }
    );

    const verification = await Verification.create({
      vendor: vendor._id,
      documents,
      status: "pending",
    });

    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } }).select("_id").lean();
    if (admins.length) {
      await Notification.insertMany(
        admins.map((a) => ({
          recipient: a._id,
          vendor: vendor._id,
          type: "system",
          title: "New verification request",
          body: `${vendor.businessName} submitted documents for verification`,
          link: "/admin/vendors",
        }))
      );
    }

    return ok({ verification }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
