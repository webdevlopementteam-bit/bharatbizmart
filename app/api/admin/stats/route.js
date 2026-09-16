import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import Vendor from "@/models/Vendor";
import Product from "@/models/Product";
import Enquiry from "@/models/Enquiry";
import Lead from "@/models/Lead";
import RFQ from "@/models/RFQ";
import Quotation from "@/models/Quotation";
import Payment from "@/models/Payment";
import Subscription from "@/models/Subscription";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireUser(["admin", "superadmin"]);
    await connectDB();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalVendors,
      totalBuyers,
      totalProducts,
      totalEnquiries,
      totalLeads,
      totalRfqs,
      totalQuotations,
      activeSubscriptions,
      revenueAgg,
      newUsersLast30,
      registrationGrowth,
      vendorGrowth,
    ] = await Promise.all([
      User.countDocuments(),
      Vendor.countDocuments(),
      User.countDocuments({ role: "buyer" }),
      Product.countDocuments(),
      Enquiry.countDocuments(),
      Lead.countDocuments(),
      RFQ.countDocuments(),
      Quotation.countDocuments(),
      Subscription.countDocuments({ status: "active" }),
      Payment.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Vendor.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return ok({
      cards: {
        totalUsers,
        totalVendors,
        totalBuyers,
        totalProducts,
        totalEnquiries,
        totalLeads,
        totalRfqs,
        totalQuotations,
        activeSubscriptions,
        revenue: revenueAgg[0]?.total || 0,
        newRegistrations: newUsersLast30,
      },
      charts: {
        registrationGrowth: registrationGrowth.map((d) => ({ month: d._id, count: d.count })),
        vendorGrowth: vendorGrowth.map((d) => ({ month: d._id, count: d.count })),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
