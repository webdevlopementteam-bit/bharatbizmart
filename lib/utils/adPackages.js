// Self-serve promotion packages a vendor can buy from /dashboard/promote —
// the "Star Supplier / Featured Listing" style upsell IndiaMART & TradeIndia
// both run. Kept server-side so the client can't forge a price.
export const AD_PACKAGES = [
  {
    key: "featured_supplier_7",
    type: "featured_supplier",
    name: "Featured Supplier — 7 days",
    description: "Appear in the homepage Featured Suppliers carousel for 7 days.",
    price: 499,
    durationDays: 7,
  },
  {
    key: "featured_supplier_30",
    type: "featured_supplier",
    name: "Featured Supplier — 30 days",
    description: "Appear in the homepage Featured Suppliers carousel for 30 days.",
    price: 1499,
    durationDays: 30,
  },
  {
    key: "featured_product_15",
    type: "featured_product",
    name: "Featured Product — 15 days",
    description: "Boost one product into Trending Products and category top results for 15 days.",
    price: 299,
    durationDays: 15,
    requiresProduct: true,
  },
  {
    key: "sponsored_listing_30",
    type: "sponsored_listing",
    name: "Sponsored Search Placement — 30 days",
    description: "Priority placement at the top of matching product search results for 30 days.",
    price: 999,
    durationDays: 30,
    requiresProduct: true,
  },
];

export function getAdPackage(key) {
  return AD_PACKAGES.find((p) => p.key === key);
}
