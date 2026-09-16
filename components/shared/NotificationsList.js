"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Bell } from "lucide-react";

export default function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/notifications").then((r) => r.json()).then((d) => setNotifications(d.notifications || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
        <Button size="sm" variant="outline" onClick={markAllRead}>Mark all read</Button>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {notifications.map((n) => (
            <Link key={n._id} href={n.link || "#"} className={`block px-4 py-3 hover:bg-slate-50 ${!n.isRead ? "bg-brand/5" : ""}`}>
              <p className="text-sm font-medium text-slate-900">{n.title}</p>
              <p className="text-xs text-slate-500">{n.body}</p>
              <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
