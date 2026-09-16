"use client";

import { use } from "react";
import SupportThread from "@/components/shared/SupportThread";

export default function AccountSupportThreadPage({ params }) {
  const { id } = use(params);
  return <SupportThread ticketId={id} />;
}
