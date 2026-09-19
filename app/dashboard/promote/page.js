"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Rocket, Megaphone } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/components/AuthProvider";
import { openRazorpayCheckout } from "@/lib/payments/razorpayCheckout";

const PACKAGES = [
  { key: "featured_supplier_7", name: "Featured Supplier — 7 days", price: 499, desc: "Appear in the homepage Featured Suppliers carousel for 7 days.", requiresProduct: false },
  { key: "featured_supplier_30", name: "Featured Supplier — 30 days", price: 1499, desc: "Appear in the homepage Featured Suppliers carousel for 30 days.", requiresProduct: false },
  { key: "featured_product_15", name: "Featured Product — 15 days", price: 299, desc: "Boost one product into Trending Products for 15 days.", requiresProduct: true },
  { key: "sponsored_listing_30", name: "Sponsored Search Placement — 30 days", price: 999, desc: "Priority placement at the top of matching search results for 30 days.", requiresProduct: true },
];

export default function PromotePage() {
  const { user } = useAuth();
  const [ads, setAds] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [productId, setProductId] = useState("");
  const [purchasing, setPurchasing] = useState(false);

  const load = () => fetch("/api/vendor/advertisements").then((r) => r.json()).then((d) => setAds(d.ads || []));
  useEffect(() => {
    load();
    fetch("/api/vendor/products").then((r) => r.json()).then((d) => setProducts(d.products || []));
  }, []);

  const buy = async (pkg) => {
    if (pkg.requiresProduct && !productId) {
      toast.error("Select a product to promote first");
      return;
    }
    setPurchasing(true);
    try {
      const res = await fetch("/api/vendor/advertisements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageKey: pkg.key, productId: pkg.requiresProduct ? productId : undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      if (data.activated) {
        toast.success("Promotion activated!");
        load();
        return;
      }

      const paymentResponse = await openRazorpayCheckout({
        order: data.order,
        keyId: data.keyId,
        name: "BharatBizMart",
        description: pkg.name,
        prefill: { name: user?.name, email: user?.email },
      });

      const verifyRes = await fetch("/api/vendor/advertisements/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: data.paymentId, ...paymentResponse }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) throw new Error(verifyData.message || "Payment verification failed");

      toast.success("Payment successful — promotion activated!");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <Rocket className="h-5 w-5 text-brand" />
        <h1 className="text-xl font-bold text-slate-900">Promote Your Business</h1>
      </div>
      <p className="mb-6 text-sm text-slate-500">
        Get more visibility with featured placements — the same self-serve boosts IndiaMART&apos;s Star Supplier and TradeIndia&apos;s Super Seller packages offer.
      </p>

      <div className="mb-6">
        <label className="text-xs font-medium text-slate-600">Product to promote (for product-based packages)</label>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="mt-1 w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">Select a product</option>
          {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PACKAGES.map((pkg) => (
          <div key={pkg.key} className={clsx("card-premium rounded-2xl p-5", selected === pkg.key && "ring-2 ring-brand/30")}>
            <div className="flex items-center justify-between">
              <Megaphone className="h-6 w-6 text-brand" />
              <span className="font-display text-xl font-bold text-slate-900">₹{pkg.price}</span>
            </div>
            <h3 className="mt-3 font-semibold text-slate-900">{pkg.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{pkg.desc}</p>
            <Button
              size="sm"
              variant="accent"
              className="mt-4 w-full"
              disabled={purchasing}
              onClick={() => {
                setSelected(pkg.key);
                buy(pkg);
              }}
            >
              Buy Now
            </Button>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold text-slate-900">Your Active & Past Promotions</h2>
      <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {ads.length === 0 && <p className="p-4 text-sm text-slate-400">No promotions purchased yet.</p>}
        {ads.map((ad) => (
          <div key={ad._id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{ad.title}</p>
              <p className="text-xs text-slate-500">{ad.product?.name}</p>
            </div>
            <div className="text-right">
              <Badge tone={ad.status === "active" ? "verified" : "neutral"}>{ad.status}</Badge>
              <p className="mt-1 text-xs text-slate-400">until {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : "-"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
