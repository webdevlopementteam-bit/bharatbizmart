import Lead from "@/models/Lead";
import Enquiry from "@/models/Enquiry";
import Subscription from "@/models/Subscription";
import SubscriptionPlan from "@/models/SubscriptionPlan";

// Masks a phone/email down to a hint, e.g. "9876543210" -> "98••••••10",
// "buyer@mail.com" -> "bu•••••om" — enough to confirm it's real, not enough to contact.
export function maskContact(value) {
  if (!value) return value;
  const str = String(value);
  if (str.length <= 4) return "•".repeat(str.length);
  return str.slice(0, 2) + "•".repeat(Math.max(str.length - 4, 3)) + str.slice(-2);
}

export function startOfCurrentMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

async function resolveVendorPlan(vendorId, vendor) {
  const subscription = await Subscription.findOne({ vendor: vendorId, status: "active" }).lean();
  const planKey = subscription?.planKey || vendor?.subscriptionPlan || "free";
  const plan = await SubscriptionPlan.findOne({ key: planKey }).lean();
  return plan;
}

/**
 * Core lead paywall (the same mechanic that funds IndiaMART/TradeIndia): every
 * plan caps how many buyer leads a vendor can see in full each calendar month.
 * Every model that carries buyer contact details for a vendor (Lead, Enquiry)
 * shares this one quota — leads and enquiries are created 1:1 for the same
 * buyer action, so ranking each collection by its own createdAt independently
 * lands on the same "first N this month" set without needing a cross-collection
 * join. Documents are never hidden — only contact fields past the quota are
 * masked, with the earliest documents each month counting as "used" first.
 */
async function annotateWithMonthlyQuota(Model, vendor, items, { phoneField, emailField }) {
  const plan = await resolveVendorPlan(vendor._id, vendor);
  const limit = plan?.limits?.leadsPerMonth ?? 20;
  const monthStart = startOfCurrentMonth();

  const thisMonthIds = await Model.find({ vendor: vendor._id, createdAt: { $gte: monthStart } })
    .sort({ createdAt: 1 })
    .select("_id")
    .lean();
  const unlockedIds = new Set(thisMonthIds.slice(0, limit).map((d) => String(d._id)));
  const usedThisMonth = thisMonthIds.length;

  const annotated = items.map((item) => {
    const inQuotaWindow = new Date(item.createdAt) >= monthStart;
    const isLocked = inQuotaWindow && !unlockedIds.has(String(item._id));
    if (!isLocked) return { ...item, isLocked: false };
    return { ...item, isLocked: true, [phoneField]: maskContact(item[phoneField]), [emailField]: maskContact(item[emailField]) };
  });

  return { items: annotated, usage: { limit, usedThisMonth, planName: plan?.name || "Free" } };
}

export async function annotateLeadsWithPlanLimit(vendor, leads) {
  const { items, usage } = await annotateWithMonthlyQuota(Lead, vendor, leads, { phoneField: "phone", emailField: "email" });
  return { leads: items, usage };
}

export async function annotateEnquiriesWithPlanLimit(vendor, enquiries) {
  const { items, usage } = await annotateWithMonthlyQuota(Enquiry, vendor, enquiries, { phoneField: "mobile", emailField: "email" });
  return { enquiries: items, usage };
}
