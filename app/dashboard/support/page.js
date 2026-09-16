import SupportTickets from "@/components/shared/SupportTickets";

export const metadata = { title: "Support" };

export default function DashboardSupportPage() {
  return <SupportTickets basePath="/dashboard/support" />;
}
