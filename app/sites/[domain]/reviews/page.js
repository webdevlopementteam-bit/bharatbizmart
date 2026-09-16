import { notFound } from "next/navigation";
import { getSiteContext } from "@/lib/tenant/getSiteContext";
import Review from "@/models/Review";
import Rating from "@/components/ui/Rating";
import ReviewForm from "@/components/marketplace/ReviewForm";
import EmptyState from "@/components/ui/EmptyState";
import { Star } from "lucide-react";

export default async function VendorReviewsListPage({ params }) {
  const { domain } = await params;
  const site = await getSiteContext(domain);
  if (!site) notFound();

  const reviews = await Review.find({ vendor: site.vendor._id, status: "approved" }).populate("buyer", "name").sort({ createdAt: -1 }).lean();
  const data = JSON.parse(JSON.stringify({ vendor: site.vendor, reviews }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Reviews</h1>
        <Rating value={data.vendor.ratingAverage} count={data.vendor.ratingCount} size="md" />
      </div>

      {data.reviews.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Star} title="No reviews yet" /></div>
      ) : (
        <div className="mt-8 space-y-4">
          {data.reviews.map((r) => (
            <div key={r._id} className="card-premium rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900">{r.buyer?.name}</p>
                <Rating value={r.rating} showCount={false} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      <ReviewForm vendorId={data.vendor._id} />
    </div>
  );
}
