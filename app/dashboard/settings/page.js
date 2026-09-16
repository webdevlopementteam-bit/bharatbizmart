"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";

export default function VendorSettingsPage() {
  const { user, refresh } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      await refresh();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSavingPwd(true);
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
      setSavingPwd(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-xl font-bold text-slate-900">Settings</h1>

      <form onSubmit={saveProfile} className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Account Details</h2>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Name</label>
            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Email</label>
            <input value={user?.email || ""} disabled className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Phone</label>
            <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <Button type="submit" disabled={savingProfile} className="mt-4">{savingProfile ? "Saving..." : "Save"}</Button>
      </form>

      <form onSubmit={changePassword} className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">Change Password</h2>
        <div className="mt-4 space-y-3">
          <input type="password" placeholder="Current password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input type="password" placeholder="New password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
        <Button type="submit" disabled={savingPwd} className="mt-4">{savingPwd ? "Updating..." : "Change Password"}</Button>
      </form>
    </div>
  );
}
