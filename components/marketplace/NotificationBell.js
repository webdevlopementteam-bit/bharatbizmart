"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = () => {
      fetch("/api/notifications?limit=6")
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          setNotifications(d.notifications || []);
          setUnreadCount(d.unreadCount || 0);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  if (!user) return null;

  const basePath = user.role === "vendor" ? "/dashboard" : user.role.includes("admin") ? "/admin" : "/account";

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button onClick={() => setOpen((v) => !v)} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && <p className="px-4 py-6 text-center text-sm text-slate-400">You&apos;re all caught up.</p>}
            {notifications.map((n) => (
              <Link
                key={n._id}
                href={n.link || `${basePath}/notifications`}
                className={`block border-b border-slate-50 px-4 py-3 hover:bg-slate-50 ${!n.isRead ? "bg-brand/5" : ""}`}
              >
                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                <p className="line-clamp-1 text-xs text-slate-500">{n.body}</p>
              </Link>
            ))}
          </div>
          <Link href={`${basePath}/notifications`} className="block px-4 py-2.5 text-center text-xs font-semibold text-brand hover:bg-slate-50">
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
