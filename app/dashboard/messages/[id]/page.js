"use client";

import { use } from "react";
import ChatWindow from "@/components/shared/ChatWindow";

export default function DashboardMessageThreadPage({ params }) {
  const { id } = use(params);
  return <ChatWindow conversationId={id} />;
}
