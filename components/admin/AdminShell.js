"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard, Building2, Boxes, Package, Users, FileText, Star,
  Settings, Menu, LogOut, ShieldCheck, Megaphone, Image as ImageIcon,
  Ticket, LifeBuoy, ExternalLink, History,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import NotificationBell from "@/components/marketplace/NotificationBell";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vendors", label: "Vendors", icon: Building2 },
  { href: "/admin/categories", label: "Categories", icon: Boxes },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/blog", label: "Blog / CMS", icon: FileText },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/advertisements", label: "Advertisements", icon: Megaphone },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/support", label: "Support Tickets", icon: LifeBuoy },
  { href: "/admin/audit-log", label: "Audit Log", icon: History, superAdminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ user, children }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-white">{user.role === "superadmin" ? "Super Admin" : "Admin Panel"}</p>
          <p className="text-[11px] text-slate-400">Platform control center</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {nav.filter((item) => !item.superAdminOnly || user.role === "superadmin").map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-amber-400" />}
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-gradient-to-b from-slate-900 to-[#1a1408] lg:block">{Sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64 bg-gradient-to-b from-slate-900 to-[#1a1408]">{Sidebar}</div>
        </div>
      )}
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:px-8">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" target="_blank" className="hidden items-center gap-1 text-sm text-slate-500 hover:text-brand sm:flex">
              View Marketplace <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <NotificationBell />
            <div className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-white">
                {user.name?.[0]?.toUpperCase()}
              </span>
              <span className="text-sm font-medium text-slate-700">{user.name}</span>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
