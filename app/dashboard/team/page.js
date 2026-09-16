"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { UsersRound, Plus, Trash2 } from "lucide-react";

export default function TeamPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "sales" });

  const load = () => {
    fetch("/api/vendor/team").then((r) => r.json()).then((d) => setEmployees(d.employees || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/vendor/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Team member invited");
      setEmployees(data.employees);
      setForm({ name: "", email: "", role: "sales" });
      setShowForm(false);
    } else toast.error(data.message);
  };

  const remove = async (id) => {
    if (!confirm("Remove this team member?")) return;
    const res = await fetch(`/api/vendor/team/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) setEmployees(data.employees);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Team</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> Invite Member</Button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="manager">Manager</option>
            <option value="sales">Sales</option>
            <option value="support">Support</option>
          </select>
          <Button type="submit" size="sm" className="sm:col-span-3">Send Invite</Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : employees.length === 0 ? (
        <EmptyState icon={UsersRound} title="No team members yet" description="Invite colleagues to help manage leads and enquiries." />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {employees.map((e) => (
            <div key={e._id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{e.name}</p>
                <p className="text-xs text-slate-500">{e.email} · {e.role}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={e.status === "active" ? "verified" : "neutral"}>{e.status}</Badge>
                <button onClick={() => remove(e._id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
