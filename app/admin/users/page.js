"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/components/AuthProvider";

const ASSIGNABLE_ROLES = ["buyer", "vendor", "admin"];

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "superadmin";
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    const qs = role ? `?role=${role}` : "";
    fetch(`/api/admin/users${qs}`).then((r) => r.json()).then((d) => setUsers(d.users || [])).finally(() => setLoading(false));
  };
  useEffect(load, [role]);

  const setStatus = async (id, status) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) { toast.success("Updated"); load(); }
  };

  const setUserRole = async (id, newRole) => {
    if (!confirm(`Change this user's role to "${newRole}"?`)) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (data.success) { toast.success("Role updated"); load(); }
    else toast.error(data.message);
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-900">Users</h1>
      <div className="mb-4 flex gap-2">
        {["", "buyer", "vendor", "admin"].map((r) => (
          <button key={r} onClick={() => setRole(r)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${role === r ? "bg-brand text-white" : "bg-slate-100 text-slate-600"}`}>
            {r || "All"}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3 capitalize">
                    {isSuperAdmin && u.role !== "superadmin" && u._id !== currentUser?.id ? (
                      <select
                        value={u.role}
                        onChange={(e) => setUserRole(u._id, e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs capitalize"
                      >
                        {ASSIGNABLE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      u.role
                    )}
                  </td>
                  <td className="px-4 py-3"><Badge tone={u.status === "active" ? "verified" : "neutral"}>{u.status}</Badge></td>
                  <td className="px-4 py-3">
                    {u.status === "active" ? (
                      <button onClick={() => setStatus(u._id, "suspended")} className="text-xs font-medium text-red-600 hover:underline">Suspend</button>
                    ) : (
                      <button onClick={() => setStatus(u._id, "active")} className="text-xs font-medium text-emerald-600 hover:underline">Activate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
