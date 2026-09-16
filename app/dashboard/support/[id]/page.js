"use client";

import { use } from "react";
import SupportThread from "@/components/shared/SupportThread";

export default function DashboardSupportThreadPage({ params }) {
  const { id } = use(params);
  return <SupportThread ticketId={id} />;
}
