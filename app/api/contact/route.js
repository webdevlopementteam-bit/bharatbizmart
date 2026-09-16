import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import Notification from "@/models/Notification";
import { ok, fail } from "@/lib/utils/api";
import { rateLimitAsync, clientIpFromRequest } from "@/lib/utils/rateLimit";

// Contact form used on a vendor's mini website (spec section 9, Contact page).
export async function POST(request) {
  const { allowed } = await rateLimitAsync(`contact:${clientIpFromRequest(request)}`, { limit: 10, windowMs: 60_000 });
  if (!allowed) return fail("Too many messages sent. Please try again shortly.", 429);

  const { vendorId, name, email, phone, message } = (await request.json()) || {};
  if (!vendorId || !name || !message) return fail("Name and message are required");

  await connectDB();
  const vendor = await Vendor.findOne({ _id: vendorId, status: "approved" }).select("owner businessName");
  if (!vendor) return fail("Supplier not found", 404);

  await Notification.create({
    recipient: vendor.owner,
    vendor: vendor._id,
    type: "new_enquiry",
    title: "New website contact message",
    body: `${name}: ${message.slice(0, 140)}`,
    link: "/dashboard/enquiries",
    meta: { name, email, phone, message },
  });

  return ok({ sent: true });
}
