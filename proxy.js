import { NextResponse } from "next/server";

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "bharatbizmart.com").toLowerCase();

// Dynamic per-tenant routes that must be rewritten even though they "look"
// like static files (each vendor needs its own sitemap.xml/robots.txt).
// Every other path containing a dot is treated as a real static asset served
// from the shared /public folder and is never tenant-rewritten.
const TENANT_DYNAMIC_FILES = new Set(["/sitemap.xml", "/robots.txt"]);

/**
 * Multi-tenant subdomain/custom-domain router.
 *
 * - Main marketplace (bharatbizmart.com, www.bharatbizmart.com, localhost) -> passes through untouched.
 * - Vendor subdomain (abc.bharatbizmart.com, abc.localhost:3000) -> rewritten to /sites/<hostname>/...
 * - Any other hostname (a connected custom domain, e.g. www.abcequipment.com) -> rewritten the same way.
 *
 * The rewrite is invisible to the browser: the address bar keeps showing
 * `abc.bharatbizmart.com/...` while Next.js internally renders the
 * `app/sites/[domain]/...` route tree, which resolves the tenant from the
 * hostname via lib/tenant/resolveTenant.js. No redirect is ever issued.
 */
export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const hostHeader = request.headers.get("host") || "";
  const hostname = hostHeader.split(":")[0].toLowerCase();

  // Next's internal machinery (e.g. the image optimizer fetching a local
  // /public asset) can invoke this without a real Host header. Never treat
  // an empty/unknown host as a tenant — always fail safe to the main site.
  const isMainDomain =
    !hostname ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === ROOT_DOMAIN ||
    hostname === `www.${ROOT_DOMAIN}`;

  if (isMainDomain) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // A real static asset (image, font, css, js, ...) shared from /public —
  // serve it as-is rather than rewriting into the vendor-site route tree,
  // except for the couple of dynamic "file-shaped" routes each tenant owns.
  const looksLikeStaticFile = /\.[a-zA-Z0-9]+$/.test(pathname);
  if (looksLikeStaticFile && !TENANT_DYNAMIC_FILES.has(pathname)) {
    return NextResponse.next();
  }

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = `/sites/${hostname}${pathname}`;
  rewrittenUrl.search = search;

  return NextResponse.rewrite(rewrittenUrl);
}

export const config = {
  // Skip API routes and Next internals. Everything else — including
  // /sitemap.xml and /robots.txt — is rewritten so each vendor subdomain can
  // serve its own (see app/sites/[domain]/sitemap.xml and robots.txt).
  matcher: ["/((?!api/|_next/static|_next/image).*)"],
};
