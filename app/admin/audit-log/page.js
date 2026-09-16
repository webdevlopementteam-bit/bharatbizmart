"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { History, ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const actionLabels = {
  "vendor.approved": "Approved vendor",
  "vendor.rejected": "Rejected vendor",
  "user.suspended": "Suspended user",
  "user.banned": "Banned user",
  "user.active": "Reactivated user",
};

function describeAction(action) {
  if (actionLabels[action]) return actionLabels[action];
  if (action.startsWith("user.role_changed_to_")) return `Changed role to "${action.replace("user.role_changed_to_", "")}"`;
  return action;
}

export default function AuditLogPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/admin/audit-log?limit=100").then((r) => r.json()).then((d) => setLogs(d.logs || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (user && user.role !== "superadmin") {
    return <EmptyState icon={ShieldAlert} title="Super admin access required" description="Only super admin accounts can view the audit log." />;
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Audit Log</h1>
      <p className="mb-4 text-sm text-slate-500">Every moderation action taken by admin staff across the platform.</p>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : logs.length === 0 ? (
        <EmptyState icon={History} title="No actions logged yet" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{l.actor?.name || "Unknown"}</p>
                    <p className="text-xs capitalize text-slate-400">{l.actorRole}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{describeAction(l.action)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{l.targetType} · {String(l.targetId).slice(-6)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
