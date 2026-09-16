"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard, Building2, Package, Wrench, Users2, Inbox, FileText, ReceiptText,
  Star, Globe, BarChart3, CreditCard, Settings, LifeBuoy, Menu, X, MessagesSquare, LogOut,
  Bell, UsersRound, Megaphone, ExternalLink,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import NotificationBell from "@/components/marketplace/NotificationBell";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/business", label: "My Business", icon: Building2 },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/services", label: "Services", icon: Wrench },
  { href: "/dashboard/leads", label: "Leads", icon: Users2 },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/dashboard/rfqs", label: "RFQs", icon: FileText },
  { href: "/dashboard/quotations", label: "Quotations", icon: ReceiptText },
  { href: "/dashboard/messages", label: "Messages", icon: MessagesSquare },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/website", label: "Website", icon: Globe },
  { href: "/dashboard/promote", label: "Promote", icon: Megaphone },
  { href: "/dashboard/team", label: "Team", icon: UsersRound },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/support", label: "Help & Support", icon: LifeBuoy },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardShell({ user, children }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-light to-brand text-white font-bold shadow-lg shadow-brand/30">B</div>
        <div>
          <p className="font-display text-sm font-bold text-white">Vendor Panel</p>
          <p className="text-[11px] text-slate-400">Manage your business</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
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
              {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />}
              <item.icon className="h-4 w-4 shrink-0" />
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
      <aside className="hidden w-64 shrink-0 bg-gradient-to-b from-slate-900 to-[#150f33] lg:block">{SidebarContent}</aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64 bg-gradient-to-b from-slate-900 to-[#150f33]">{SidebarContent}</div>
        </div>
      )}

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:px-8">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" target="_blank" className="hidden items-center gap-1 text-sm text-slate-500 hover:text-brand sm:flex">
              View Marketplace <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <NotificationBell />
            <div className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-brand text-xs font-bold text-white">
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
