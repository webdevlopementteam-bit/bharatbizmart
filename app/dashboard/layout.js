import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  if (user.role !== "vendor") redirect("/");

  return <DashboardShell user={JSON.parse(JSON.stringify(user))}>{children}</DashboardShell>;
}
