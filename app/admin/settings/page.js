"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";

const envGroups = [
  { title: "Domain / Multi-tenant", vars: ["NEXT_PUBLIC_ROOT_DOMAIN", "NEXT_PUBLIC_APP_URL"] },
  { title: "Storage (Cloudinary)", vars: ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"] },
  { title: "Payments", vars: ["PAYMENT_PROVIDER", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] },
  { title: "Email", vars: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "EMAIL_FROM"] },
];

export default function AdminSettingsPage() {
  const { user, refresh } = useAuth();
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pwd),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success("Password changed");
      setPwd({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-xl font-bold text-slate-900">Settings</h1>

      <form onSubmit={changePassword} className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Change Password</h2>
        <div className="mt-4 space-y-3">
          <input type="password" placeholder="Current password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input type="password" placeholder="New password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <Button type="submit" disabled={saving} className="mt-4">{saving ? "Updating..." : "Change Password"}</Button>
      </form>

      {user?.role === "superadmin" && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">Platform Configuration</h2>
          <p className="mt-1 text-xs text-slate-500">
            These are controlled via environment variables on the server (see <code>.env.local</code>). Update and redeploy to change them.
          </p>
          <div className="mt-4 space-y-4">
            {envGroups.map((g) => (
              <div key={g.title}>
                <p className="text-xs font-semibold uppercase text-slate-400">{g.title}</p>
                <ul className="mt-1 space-y-0.5 text-sm text-slate-600">
                  {g.vars.map((v) => <li key={v} className="font-mono text-xs">{v}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
