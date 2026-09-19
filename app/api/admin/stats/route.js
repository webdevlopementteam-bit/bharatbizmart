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
import SupportTicket from "@/models/SupportTicket";
import { requireUser, handleApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

export async function GET() {
  try {
    await requireUser(["admin", "superadmin"]);
    await connectDB();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

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
      pendingApprovals,
      openSupportTickets,
      revenueAgg,
      revenueLast30Agg,
      revenueBySourceAgg,
      newUsersLast30,
      registrationGrowth,
      vendorGrowth,
      revenueGrowth,
      vendorStatusBreakdown,
      planBreakdown,
      recentVendors,
      recentRfqs,
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
      Vendor.countDocuments({ status: "pending_approval" }),
      SupportTicket.countDocuments({ status: { $in: ["open", "in_progress"] } }),
      Payment.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
      Payment.aggregate([
        { $match: { status: "success", createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: "$purpose", total: { $sum: "$amount" } } },
      ]),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Vendor.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: { status: "success", createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$amount" } } },
        { $sort: { _id: 1 } },
      ]),
      Vendor.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Vendor.aggregate([{ $group: { _id: "$subscriptionPlan", count: { $sum: 1 } } }]),
      Vendor.find().sort({ createdAt: -1 }).limit(6).select("businessName slug status createdAt").lean(),
      RFQ.find().sort({ createdAt: -1 }).limit(6).populate("buyer", "name").select("title status createdAt buyer").lean(),
    ]);

    const statusMap = Object.fromEntries(vendorStatusBreakdown.map((s) => [s._id, s.count]));
    const planMap = Object.fromEntries(planBreakdown.map((p) => [p._id || "free", p.count]));
    const revenueBySourceMap = Object.fromEntries(revenueBySourceAgg.map((r) => [r._id, r.total]));
    const payingVendors = (planMap.growth || 0) + (planMap.premium || 0) + (planMap.enterprise || 0);

    // Fill every day in the 30-day window (not just days that had activity)
    // so the trend line is continuous instead of skipping gaps.
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      return d.toISOString().slice(0, 10);
    });
    const fillDaily = (rows, valueKey) => {
      const map = Object.fromEntries(rows.map((r) => [r._id, r[valueKey]]));
      return last30Days.map((day) => ({ day, [valueKey]: map[day] || 0 }));
    };

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
        pendingApprovals,
        openSupportTickets,
        revenue: revenueAgg[0]?.total || 0,
        revenueLast30Days: revenueLast30Agg[0]?.total || 0,
        payingVendors,
        newRegistrations: newUsersLast30,
      },
      revenueBySource: {
        subscription: revenueBySourceMap.subscription || 0,
        advertisement: revenueBySourceMap.advertisement || 0,
      },
      charts: {
        registrationGrowth: fillDaily(registrationGrowth, "count"),
        vendorGrowth: fillDaily(vendorGrowth, "count"),
        revenueGrowth: fillDaily(revenueGrowth, "total"),
      },
      vendorStatus: {
        approved: statusMap.approved || 0,
        pending_approval: statusMap.pending_approval || 0,
        suspended: statusMap.suspended || 0,
        rejected: statusMap.rejected || 0,
      },
      planDistribution: {
        free: planMap.free || 0,
        growth: planMap.growth || 0,
        premium: planMap.premium || 0,
        enterprise: planMap.enterprise || 0,
      },
      recentVendors,
      recentRfqs,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
