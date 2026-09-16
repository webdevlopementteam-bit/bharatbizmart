"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ClipboardList, FileText, Heart, Bell, MapPin, MessagesSquare, ReceiptText, LifeBuoy, Scale } from "lucide-react";

const nav = [
  { href: "/account/enquiries", label: "My Enquiries", icon: ClipboardList },
  { href: "/account/rfqs", label: "My Requirements", icon: FileText },
  { href: "/account/quotations", label: "Quotations", icon: ReceiptText },
  { href: "/account/messages", label: "Messages", icon: MessagesSquare },
  { href: "/compare", label: "Compare Products", icon: Scale },
  { href: "/account/saved", label: "Saved Items", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/support", label: "Support", icon: LifeBuoy },
];

export default function AccountNav() {
  const pathname = usePathname();
  return (
    <aside className="space-y-1">
      {nav.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-brand/10 text-brand" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
