import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db/connect";
import Blog from "@/models/Blog";

// Note: the viewCount increment further down only fires on cache
// regeneration under ISR, not on every request — an intentional tradeoff.
export const revalidate = 120;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const post = await Blog.findOne({ slug, status: "published" }).lean();
  if (!post) return {};
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
    openGraph: { images: post.featuredImage ? [post.featuredImage] : [] },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  await connectDB();

  const post = await Blog.findOne({ slug, status: "published" }).populate("author", "name").lean();
  if (!post) notFound();

  Blog.updateOne({ _id: post._id }, { $inc: { viewCount: 1 } }).catch(() => {});

  const related = await Blog.find({ category: post.category, status: "published", _id: { $ne: post._id } }).limit(4).select("title slug featuredImage").lean();
  const data = JSON.parse(JSON.stringify({ post, related }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.post.title,
    author: { "@type": "Person", name: data.post.author?.name },
    datePublished: data.post.publishedAt,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="text-3xl font-bold text-slate-900">{data.post.title}</h1>
      <p className="mt-2 text-sm text-slate-500">By {data.post.author?.name} · {new Date(data.post.publishedAt || data.post.createdAt).toLocaleDateString()}</p>
      {data.post.featuredImage && (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-slate-100">
          <Image src={data.post.featuredImage} alt={data.post.title} fill className="object-cover" />
        </div>
      )}
      <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-700">{data.post.content}</div>

      {data.related.length > 0 && (
        <div className="mt-10 border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900">Related Articles</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {data.related.map((r) => (
              <Link key={r._id} href={`/blog/${r.slug}`} className="text-sm font-medium text-brand hover:underline">{r.title}</Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
