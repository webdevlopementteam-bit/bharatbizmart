"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import FileUpload from "@/components/dashboard/FileUpload";
import { X } from "lucide-react";

const emptyProduct = {
  name: "",
  category: "",
  images: [],
  price: { min: "", max: "", unit: "piece", isNegotiable: true },
  moq: 1,
  moqUnit: "piece",
  priceTiers: [],
  description: "",
  specifications: [],
  features: [],
  packagingDetails: "",
  deliveryDetails: "",
  paymentTerms: "",
  availability: "in_stock",
  status: "active",
};

export default function ProductForm({ initialProduct, productId }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(initialProduct || emptyProduct);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  const set = (field) => (e) => setProduct((p) => ({ ...p, [field]: e.target?.value ?? e }));
  const setPrice = (field) => (e) => setProduct((p) => ({ ...p, price: { ...p.price, [field]: e.target.value } }));

  const addImage = (url) => url && setProduct((p) => ({ ...p, images: [...p.images, url] }));
  const removeImage = (idx) => setProduct((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));

  const addSpec = () => setProduct((p) => ({ ...p, specifications: [...p.specifications, { key: "", value: "" }] }));
  const updateSpec = (idx, field) => (e) =>
    setProduct((p) => ({ ...p, specifications: p.specifications.map((s, i) => (i === idx ? { ...s, [field]: e.target.value } : s)) }));
  const removeSpec = (idx) => setProduct((p) => ({ ...p, specifications: p.specifications.filter((_, i) => i !== idx) }));

  const addTier = () => setProduct((p) => ({ ...p, priceTiers: [...(p.priceTiers || []), { minQty: "", maxQty: "", price: "" }] }));
  const updateTier = (idx, field) => (e) =>
    setProduct((p) => ({ ...p, priceTiers: p.priceTiers.map((t, i) => (i === idx ? { ...t, [field]: e.target.value } : t)) }));
  const removeTier = (idx) => setProduct((p) => ({ ...p, priceTiers: p.priceTiers.filter((_, i) => i !== idx) }));

  const submit = async (e) => {
    e.preventDefault();
    if (!product.name) return toast.error("Product name is required");
    setSaving(true);
    try {
      const payload = {
        ...product,
        price: { ...product.price, min: Number(product.price.min) || undefined, max: Number(product.price.max) || undefined },
        priceTiers: (product.priceTiers || [])
          .filter((t) => t.minQty && t.price)
          .map((t) => ({ minQty: Number(t.minQty), maxQty: t.maxQty ? Number(t.maxQty) : undefined, price: Number(t.price) })),
      };
      const res = await fetch(productId ? `/api/vendor/products/${productId}` : "/api/vendor/products", {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success(productId ? "Product updated" : "Product added");
      router.push("/dashboard/products");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Images</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {product.images.map((img, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
              <Image src={img} alt="" fill className="object-cover" />
              <button type="button" onClick={() => removeImage(i)} className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/60 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <FileUpload value="" onChange={addImage} folder="products" />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Basic Details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Product Name *" value={product.name} onChange={set("name")} />
          <div>
            <label className="text-xs font-medium text-slate-600">Category</label>
            <select value={product.category || ""} onChange={set("category")} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <TextField label="Min Price (₹)" type="number" value={product.price.min} onChange={setPrice("min")} />
          <TextField label="Max Price (₹)" type="number" value={product.price.max} onChange={setPrice("max")} />
          <TextField label="MOQ" type="number" value={product.moq} onChange={set("moq")} />
          <TextField label="MOQ Unit" value={product.moqUnit} onChange={set("moqUnit")} />
          <div>
            <label className="text-xs font-medium text-slate-600">Availability</label>
            <select value={product.availability} onChange={set("availability")} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="made_to_order">Made to Order</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Status</label>
            <select value={product.status} onChange={set("status")} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-600">Description</label>
          <textarea rows={4} value={product.description} onChange={set("description")} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Bulk Pricing (Price Breaks)</h2>
            <p className="text-xs text-slate-500">Optional — show buyers a lower price per unit at higher order quantities.</p>
          </div>
          <button type="button" onClick={addTier} className="text-xs font-medium text-brand hover:underline">+ Add tier</button>
        </div>
        <div className="mt-3 space-y-2">
          {(product.priceTiers || []).map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="number"
                value={t.minQty}
                onChange={updateTier(i, "minQty")}
                placeholder="Min qty"
                className="w-1/4 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="number"
                value={t.maxQty}
                onChange={updateTier(i, "maxQty")}
                placeholder="Max qty (blank = above)"
                className="w-1/4 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <span className="text-xs text-slate-400">@ ₹</span>
              <input
                type="number"
                value={t.price}
                onChange={updateTier(i, "price")}
                placeholder="Price / unit"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => removeTier(i)} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button>
            </div>
          ))}
          {(product.priceTiers || []).length === 0 && (
            <p className="text-xs text-slate-400">No bulk pricing tiers added — the single price above will be shown to buyers.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Specifications</h2>
          <button type="button" onClick={addSpec} className="text-xs font-medium text-brand hover:underline">+ Add row</button>
        </div>
        <div className="mt-3 space-y-2">
          {product.specifications.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input value={s.key} onChange={updateSpec(i, "key")} placeholder="Attribute" className="w-1/3 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input value={s.value} onChange={updateSpec(i, "value")} placeholder="Value" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <button type="button" onClick={() => removeSpec(i)} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Logistics</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextField label="Packaging Details" value={product.packagingDetails} onChange={set("packagingDetails")} />
          <TextField label="Delivery Details" value={product.deliveryDetails} onChange={set("deliveryDetails")} />
          <TextField label="Payment Terms" value={product.paymentTerms} onChange={set("paymentTerms")} />
        </div>
      </section>

      <Button type="submit" disabled={saving}>{saving ? "Saving..." : productId ? "Update Product" : "Add Product"}</Button>
    </form>
  );
}

function TextField({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input type={type} value={value ?? ""} onChange={onChange} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
    </div>
  );
}
