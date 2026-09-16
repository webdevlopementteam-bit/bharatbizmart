const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/account", "/api"] },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
