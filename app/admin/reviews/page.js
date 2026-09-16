"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Rating from "@/components/ui/Rating";
import Badge from "@/components/ui/Badge";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    const qs = filter ? `?status=${filter}` : "";
    fetch(`/api/admin/reviews${qs}`).then((r) => r.json()).then((d) => setReviews(d.reviews || [])).finally(() => setLoading(false));
  };
  useEffect(load, [filter]);

  const setStatus = async (id, status) => {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) { toast.success("Updated"); load(); }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Reviews</h1>
      <div className="mb-4 flex gap-2">
        {["", "pending", "approved", "reported"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filter === s ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
            {s || "All"}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.buyer?.name} → {r.vendor?.businessName}</p>
                  <Rating value={r.rating} showCount={false} />
                </div>
                <Badge tone={r.status === "approved" ? "verified" : "neutral"}>{r.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
              <div className="mt-3 flex gap-2">
                {r.status !== "approved" && <button onClick={() => setStatus(r._id, "approved")} className="text-xs font-medium text-emerald-600 hover:underline">Approve</button>}
                {r.status !== "rejected" && <button onClick={() => setStatus(r._id, "rejected")} className="text-xs font-medium text-red-600 hover:underline">Reject</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
