import dns from "node:dns/promises";
import { connectDB } from "@/lib/db/connect";
import Domain from "@/models/Domain";
import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

// Checks the CNAME record actually points at us before marking a custom
// domain verified. SSL issuance itself is delegated to the hosting platform
// (e.g. Vercel's Domains API) once DNS is confirmed — sslStatus tracks that.
export async function POST(request, { params }) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { id } = await params;

    await connectDB();
    const domain = await Domain.findOne({ _id: id, vendor: vendor._id });
    if (!domain) throw new ApiError(404, "Domain not found");

    let verified = false;
    try {
      const records = await dns.resolveCname(domain.hostname);
      verified = records.some((r) => r.toLowerCase() === domain.cnameTarget.toLowerCase());
    } catch {
      verified = false;
    }

    domain.lastCheckedAt = new Date();
    if (verified) {
      domain.status = "verified";
      domain.verifiedAt = new Date();
      domain.sslStatus = "issued";
    } else {
      domain.status = "failed";
    }
    await domain.save();

    return ok({ domain, verified });
  } catch (err) {
    return handleApiError(err);
  }
}
