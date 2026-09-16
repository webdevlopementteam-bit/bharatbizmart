"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";

export default function ReviewForm({ vendorId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to leave a review");
      router.push("/login");
      return;
    }
    if (!rating) return toast.error("Please select a rating");

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor: vendorId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success("Review submitted");
      setRating(0);
      setComment("");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-900">Write a Review</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)}>
            <Star className={`h-6 w-6 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <Button type="submit" size="sm" disabled={submitting} className="mt-3">{submitting ? "Submitting..." : "Submit Review"}</Button>
    </form>
  );
}
