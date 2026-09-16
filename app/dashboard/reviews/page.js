"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Rating from "@/components/ui/Rating";
import EmptyState from "@/components/ui/EmptyState";
import { Star } from "lucide-react";

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  const load = () => {
    fetch("/api/vendor/reviews").then((r) => r.json()).then((d) => setReviews(d.reviews || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const reply = async (id) => {
    const text = replyText[id];
    if (!text) return;
    const res = await fetch(`/api/vendor/reviews?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: text }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Reply posted");
      load();
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Reviews</h1>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{r.buyer?.name}</p>
                <Rating value={r.rating} showCount={false} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
              {r.vendorReply?.text ? (
                <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600"><strong>Your reply:</strong> {r.vendorReply.text}</p>
              ) : (
                <div className="mt-3 flex gap-2">
                  <input
                    value={replyText[r._id] || ""}
                    onChange={(e) => setReplyText((s) => ({ ...s, [r._id]: e.target.value }))}
                    placeholder="Write a reply..."
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                  />
                  <button onClick={() => reply(r._id)} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white">Reply</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
