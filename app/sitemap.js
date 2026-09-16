import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Vendor from "@/models/Vendor";
import Blog from "@/models/Blog";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const staticRoutes = ["", "/products", "/categories", "/suppliers", "/services", "/rfq", "/post-requirement", "/blog", "/register-business"];

export default async function sitemap() {
  await connectDB();

  const [products, categories, vendors, posts] = await Promise.all([
    Product.find({ status: "active" }).select("slug updatedAt").limit(5000).lean(),
    Category.find({ status: "active" }).select("slug updatedAt").lean(),
    Vendor.find({ status: "approved" }).select("slug updatedAt").limit(5000).lean(),
    Blog.find({ status: "published" }).select("slug updatedAt").lean(),
  ]);

  return [
    ...staticRoutes.map((route) => ({ url: `${APP_URL}${route}`, lastModified: new Date() })),
    ...products.map((p) => ({ url: `${APP_URL}/products/${p.slug}`, lastModified: p.updatedAt })),
    ...categories.map((c) => ({ url: `${APP_URL}/categories/${c.slug}`, lastModified: c.updatedAt })),
    ...vendors.map((v) => ({ url: `${APP_URL}/suppliers/${v.slug}`, lastModified: v.updatedAt })),
    ...posts.map((p) => ({ url: `${APP_URL}/blog/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
