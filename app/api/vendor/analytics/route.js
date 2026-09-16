import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import Enquiry from "@/models/Enquiry";
import Lead from "@/models/Lead";
import RFQQuotation from "@/models/Quotation";
import { requireUser, requireVendorContext, handleApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

export async function GET() {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    await connectDB();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [productCount, activeLeadsCount, enquiriesLast30, leadsByDay, quotationsCount] = await Promise.all([
      Product.countDocuments({ vendor: vendor._id, status: { $ne: "archived" } }),
      Lead.countDocuments({ vendor: vendor._id, status: { $nin: ["won", "lost"] } }),
      Enquiry.countDocuments({ vendor: vendor._id, createdAt: { $gte: thirtyDaysAgo } }),
      Lead.aggregate([
        { $match: { vendor: vendor._id, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      RFQQuotation.countDocuments({ vendor: vendor._id }),
    ]);

    return ok({
      cards: {
        profileViews: vendor.analytics?.profileViews || 0,
        productViews: vendor.analytics?.productViews || 0,
        websiteVisitors: vendor.analytics?.websiteVisitors || 0,
        leads: activeLeadsCount,
        enquiries: enquiriesLast30,
        products: productCount,
        quotations: quotationsCount,
        calls: vendor.analytics?.callsCount || 0,
      },
      charts: {
        leadsByDay: leadsByDay.map((d) => ({ date: d._id, count: d.count })),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
