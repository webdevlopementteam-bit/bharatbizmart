"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function ChatWindow({ conversationId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const senderType = user?.role === "vendor" ? "vendor" : "buyer";

  const load = async () => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`, { cache: "no-store" });
    const data = await res.json();
    if (data.success) {
      setMessages(data.messages);
      setConversation(data.conversation);
    }
  };

  useEffect(() => {
    // Polling keeps this simple and dependency-free; swap for a Socket.IO
    // subscription here once a realtime transport is wired up server-side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((m) => [...m, data.message]);
        setText("");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">
          {senderType === "vendor" ? conversation?.buyer?.name : conversation?.vendor?.businessName}
        </p>
        {conversation?.product && <p className="text-xs text-slate-500">Re: {conversation.product.name}</p>}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m._id} className={`flex ${m.senderType === senderType ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                m.senderType === senderType ? "bg-brand text-white" : "bg-slate-100 text-slate-800"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {messages.length === 0 && <p className="text-center text-sm text-slate-400">Say hello to start the conversation.</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-100 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={sending}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
