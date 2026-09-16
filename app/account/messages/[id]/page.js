"use client";

import { use } from "react";
import ChatWindow from "@/components/shared/ChatWindow";

export default function AccountMessageThreadPage({ params }) {
  const { id } = use(params);
  return <ChatWindow conversationId={id} />;
}
