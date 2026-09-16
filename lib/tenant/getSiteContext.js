import { resolveTenant } from "./resolveTenant";

/**
 * Used by every page under app/sites/[domain] — resolves the hostname
 * (passed through by middleware.js) to a live vendor tenant. Returns null
 * if there's no such tenant or the site isn't published yet, so callers can
 * render notFound().
 */
export async function getSiteContext(domain) {
  const tenant = await resolveTenant(decodeURIComponent(domain));
  if (!tenant.vendor || !tenant.website) return null;
  if (tenant.vendor.status !== "approved" || tenant.website.status !== "live") return null;
  return tenant;
}
