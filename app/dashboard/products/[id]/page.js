"use client";

import { use, useEffect, useState } from "react";
import ProductForm from "@/components/dashboard/ProductForm";

export default function EditProductPage({ params }) {
  const { id } = use(params);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`/api/vendor/products/${id}`).then((r) => r.json()).then((d) => setProduct(d.product));
  }, [id]);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Edit Product</h1>
      {product ? <ProductForm initialProduct={product} productId={id} /> : <p className="text-sm text-slate-400">Loading...</p>}
    </div>
  );
}
