"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { LifeBuoy, Plus } from "lucide-react";

const tone = { open: "trusted", in_progress: "premium", resolved: "verified", closed: "neutral" };

export default function SupportTickets({ basePath }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "other", description: "", priority: "medium" });

  const load = () => {
    fetch("/api/support").then((r) => r.json()).then((d) => setTickets(d.tickets || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Ticket raised — our team will respond shortly");
      setForm({ subject: "", category: "other", description: "", priority: "medium" });
      setShowForm(false);
      load();
    } else toast.error(data.message);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Support Tickets</h1>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}><Plus className="h-4 w-4" /> Raise a Ticket</Button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="verification">Verification</option>
              <option value="other">Other</option>
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your issue..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <Button type="submit" size="sm">Submit Ticket</Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No support tickets" description="Need help? Raise a ticket and our team will get back to you." />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {tickets.map((t) => (
            <Link key={t._id} href={`${basePath}/${t._id}`} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
              <div>
                <p className="text-sm font-medium text-slate-900">{t.subject}</p>
                <p className="text-xs text-slate-500 capitalize">{t.category} · {new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
              <Badge tone={tone[t.status]}>{t.status.replace("_", " ")}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
