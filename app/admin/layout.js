import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!["admin", "superadmin"].includes(user.role)) redirect("/");

  return <AdminShell user={JSON.parse(JSON.stringify(user))}>{children}</AdminShell>;
}
