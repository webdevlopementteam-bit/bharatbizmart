"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, X, User, ChevronDown, Scale } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useCompare } from "@/components/CompareProvider";
import Button from "@/components/ui/Button";
import CategoriesMegaMenu from "@/components/marketplace/CategoriesMegaMenu";
import NotificationBell from "@/components/marketplace/NotificationBell";
import Logo from "@/components/marketplace/Logo";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const { items } = useCompare();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/products${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo size="sm" />

        <nav className="hidden items-center gap-1 lg:flex">
          <CategoriesMegaMenu />
          <Link href="/products" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Buy
          </Link>
          <Link href="/register-business" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Sell
          </Link>
          <Link href="/suppliers" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            Suppliers
          </Link>
        </nav>

        <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, suppliers, categories..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          {items.length > 0 && (
            <Link href="/compare" className="relative hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand sm:flex">
              <Scale className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {items.length}
              </span>
            </Link>
          )}

          <span className="hidden sm:inline-flex">
            <Button href="/post-requirement" size="sm" variant="accent">
              Post Requirement
            </Button>
          </span>

          {!loading && !user && (
            <>
              <span className="hidden sm:inline-flex">
                <Button href="/login" size="sm" variant="ghost">
                  Login
                </Button>
              </span>
              <span className="hidden sm:inline-flex">
                <Button href="/register" size="sm" variant="outline">
                  Register
                </Button>
              </span>
            </>
          )}

          {!loading && user && (
            <>
              <NotificationBell />
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-brand text-xs font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                  {user.name.split(" ")[0]}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {accountOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl"
                    onMouseLeave={() => setAccountOpen(false)}
                  >
                    {user.role === "vendor" && (
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        Vendor Dashboard
                      </Link>
                    )}
                    {(user.role === "admin" || user.role === "superadmin") && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        Admin Panel
                      </Link>
                    )}
                    {user.role === "buyer" && (
                      <>
                        <Link href="/account/enquiries" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          My Enquiries
                        </Link>
                        <Link href="/account/rfqs" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          My Requirements
                        </Link>
                        <Link href="/account/saved" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                          Saved Items
                        </Link>
                      </>
                    )}
                    <Link href="/compare" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      Compare Products
                    </Link>
                    <button onClick={logout} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 py-3 lg:hidden">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, suppliers..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none"
              />
            </div>
          </form>
          <div className="flex flex-col gap-1">
            <Link href="/categories" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Categories</Link>
            <Link href="/products" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Buy</Link>
            <Link href="/register-business" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Sell</Link>
            <Link href="/suppliers" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Suppliers</Link>
            <Link href="/post-requirement" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Post Requirement</Link>
            <Link href="/compare" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Compare Products {items.length > 0 && `(${items.length})`}</Link>
            {!user ? (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Login</Link>
                <Link href="/register" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Register</Link>
              </>
            ) : (
              <>
                <Link href={user.role === "vendor" ? "/dashboard" : "/account/enquiries"} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  My Account
                </Link>
                <button onClick={logout} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">Sign out</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
