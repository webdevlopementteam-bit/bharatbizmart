import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import Page from "@/models/Page";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  await connectDB();
  const page = await Page.findOne({ slug, status: "published" }).lean();
  if (!page) return {};
  return { title: page.seo?.title || page.title, description: page.seo?.description };
}

export default async function CmsPage({ params }) {
  const { slug } = await params;
  await connectDB();

  const page = await Page.findOne({ slug, status: "published" }).lean();
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">{page.title}</h1>
      <div className="prose prose-slate mt-6 max-w-none whitespace-pre-line text-sm leading-relaxed text-slate-700">{page.content}</div>
    </div>
  );
}
