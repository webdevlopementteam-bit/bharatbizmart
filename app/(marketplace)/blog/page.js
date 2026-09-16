import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db/connect";
import Blog from "@/models/Blog";
import EmptyState from "@/components/ui/EmptyState";
import { Newspaper } from "lucide-react";

export const metadata = {
  title: "Blog",
  description: "Insights, guides and news for B2B buyers and sellers.",
};

export const revalidate = 120;

export default async function BlogListPage() {
  await connectDB();
  const posts = await Blog.find({ status: "published" }).populate("author", "name").sort({ publishedAt: -1 }).limit(24).lean();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
      {posts.length === 0 ? (
        <EmptyState icon={Newspaper} title="No articles published yet" />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p._id} href={`/blog/${p.slug}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white hover:shadow-md">
              <div className="relative aspect-video bg-slate-100">
                {p.featuredImage && <Image src={p.featuredImage} alt={p.title} fill className="object-cover" />}
              </div>
              <div className="p-4">
                <h2 className="line-clamp-2 text-sm font-semibold text-slate-900">{p.title}</h2>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.excerpt}</p>
                <p className="mt-2 text-xs text-slate-400">{p.author?.name} · {new Date(p.publishedAt || p.createdAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
