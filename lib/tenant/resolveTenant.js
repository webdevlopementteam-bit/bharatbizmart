import { connectDB } from "@/lib/db/connect";
import Vendor from "@/models/Vendor";
import Website from "@/models/Website";
import Domain from "@/models/Domain";

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bharatbizmart.com").toLowerCase();

// Hostnames that always mean "the main marketplace", never a vendor tenant.
const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api", "cdn", "mail", "static"]);

/**
 * Pulls the bare hostname (no port) out of a `host` header value.
 */
export function stripPort(hostname) {
  return (hostname || "").split(":")[0].toLowerCase();
}

/**
 * Determines whether `hostname` is the main marketplace domain, a
 * `<subdomain>.ROOT_DOMAIN` vendor tenant, or a fully custom domain a vendor
 * has connected — without ever redirecting the browser (the caller renders a
 * different route internally, e.g. via middleware rewrite).
 *
 * Handles local development (`abc.localhost:3000`) the same way it handles
 * production (`abc.bharatbizmart.com`).
 */
export function classifyHostname(rawHostname) {
  const hostname = stripPort(rawHostname);

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return { domainType: "main", subdomain: null };
  }

  // Local dev subdomain: abc.localhost
  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.replace(".localhost", "");
    if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) return { domainType: "main", subdomain: null };
    return { domainType: "subdomain", subdomain };
  }

  // Production subdomain: abc.bharatbizmart.com
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = hostname.slice(0, -1 * (ROOT_DOMAIN.length + 1));
    if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain) || subdomain.includes(".")) {
      return { domainType: "main", subdomain: null };
    }
    return { domainType: "subdomain", subdomain };
  }

  // Anything else is a candidate custom domain, e.g. www.abcequipment.com
  return { domainType: "custom", subdomain: null, hostname };
}

/**
 * Resolves an incoming request hostname to a tenant. Returns:
 *   { tenantId, vendorId, domainType, vendor, website } for a vendor tenant
 *   { tenantId: null, vendorId: null, domainType: "main", vendor: null } for the marketplace
 *
 * This is the single source of truth for tenant identity server-side and
 * must be used consistently from middleware, server components and API
 * routes — a client can never assert its own tenantId.
 */
export async function resolveTenant(rawHostname) {
  const classified = classifyHostname(rawHostname);

  if (classified.domainType === "main") {
    return { tenantId: null, vendorId: null, domainType: "main", vendor: null, website: null };
  }

  await connectDB();

  let vendor = null;

  if (classified.domainType === "subdomain") {
    const website = await Website.findOne({ subdomain: classified.subdomain }).lean();
    if (website) {
      vendor = await Vendor.findById(website.vendor).lean();
      return {
        tenantId: String(vendor?._id || website.vendor),
        vendorId: String(website.vendor),
        domainType: "subdomain",
        subdomain: classified.subdomain,
        vendor,
        website,
      };
    }
    return { tenantId: null, vendorId: null, domainType: "subdomain", subdomain: classified.subdomain, vendor: null, website: null };
  }

  if (classified.domainType === "custom") {
    const domain = await Domain.findOne({ hostname: classified.hostname, status: "verified" }).lean();
    if (domain) {
      const website = await Website.findOne({ vendor: domain.vendor }).lean();
      vendor = await Vendor.findById(domain.vendor).lean();
      return {
        tenantId: String(vendor?._id || domain.vendor),
        vendorId: String(domain.vendor),
        domainType: "custom",
        hostname: classified.hostname,
        vendor,
        website,
      };
    }
    return { tenantId: null, vendorId: null, domainType: "custom", hostname: classified.hostname, vendor: null, website: null };
  }

  return { tenantId: null, vendorId: null, domainType: "main", vendor: null, website: null };
}

export { ROOT_DOMAIN };
