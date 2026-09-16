// Builds a vendor's public website URL from NEXT_PUBLIC_APP_URL rather than
// hardcoding NEXT_PUBLIC_ROOT_DOMAIN — that way "View Website" links resolve
// correctly in every environment: http://slug.localhost:3000 in local dev,
// https://slug.bharatbizmart.com in production, and whatever a staging
// deploy's APP_URL happens to be, all from the same one source of truth.
// Works identically on the server and in the browser (no `window` needed),
// so it's safe to call from both Server and Client Components.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function getVendorSiteUrl(subdomain) {
  try {
    const url = new URL(APP_URL);
    url.hostname = `${subdomain}.${url.hostname}`;
    return url.toString().replace(/\/$/, "");
  } catch {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bharatbizmart.com";
    return `https://${subdomain}.${rootDomain}`;
  }
}

export function getVendorSiteHost(subdomain) {
  return getVendorSiteUrl(subdomain).replace(/^https?:\/\//, "");
}
