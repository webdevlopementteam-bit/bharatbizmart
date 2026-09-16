"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import EmptyState from "@/components/ui/EmptyState";
import { MessagesSquare } from "lucide-react";

export default function ConversationList({ basePath }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => setConversations(data.conversations || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-400">Loading conversations...</p>;

  if (conversations.length === 0) {
    return <EmptyState icon={MessagesSquare} title="No conversations yet" description="Messages with buyers/suppliers will show up here." />;
  }

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {conversations.map((c) => {
        const unread = user?.role === "vendor" ? c.unreadByVendor : c.unreadByBuyer;
        return (
          <Link key={c._id} href={`${basePath}/${c._id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {user?.role === "vendor" ? c.buyer?.name : c.vendor?.businessName}
              </p>
              <p className="line-clamp-1 text-xs text-slate-500">{c.lastMessage || "No messages yet"}</p>
            </div>
            {unread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-semibold text-white">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
