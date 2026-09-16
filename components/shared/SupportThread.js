"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/components/AuthProvider";

const tone = { open: "trusted", in_progress: "premium", resolved: "verified", closed: "neutral" };

export default function SupportThread({ ticketId }) {
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const isStaff = user && ["admin", "superadmin"].includes(user.role);

  const load = () => {
    fetch(`/api/support/${ticketId}`).then((r) => r.json()).then((d) => setTicket(d.ticket));
  };
  useEffect(load, [ticketId]);

  const reply = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setTicket(data.ticket);
      setText("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status) => {
    const res = await fetch(`/api/support/${ticketId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Status updated");
      setTicket(data.ticket);
    }
  };

  if (!ticket) return <p className="text-sm text-slate-400">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{ticket.subject}</h1>
          <p className="text-sm text-slate-500">
            {ticket.user?.name} · <span className="capitalize">{ticket.category}</span> · Priority: {ticket.priority}
          </p>
        </div>
        <Badge tone={tone[ticket.status]}>{ticket.status.replace("_", " ")}</Badge>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="whitespace-pre-line text-sm text-slate-700">{ticket.description}</p>
      </div>

      <div className="mt-4 space-y-3">
        {ticket.replies?.map((r, i) => (
          <div key={i} className={`rounded-xl p-3 text-sm ${r.isStaff ? "bg-brand/5 text-slate-800" : "bg-slate-50 text-slate-700"}`}>
            <p className="mb-1 text-xs font-semibold text-slate-500">{r.isStaff ? "Support Team" : "You"}</p>
            {r.text}
          </div>
        ))}
      </div>

      <form onSubmit={reply} className="mt-4 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a reply..." className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <Button type="submit" size="sm" disabled={sending}>Send</Button>
      </form>

      {isStaff && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setStatus("resolved")}>Mark Resolved</Button>
          <Button size="sm" variant="ghost" onClick={() => setStatus("closed")}>Close Ticket</Button>
        </div>
      )}
    </div>
  );
}
