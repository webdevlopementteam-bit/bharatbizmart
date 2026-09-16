import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import Header from "@/components/marketplace/Header";
import Footer from "@/components/marketplace/Footer";
import AccountNav from "@/components/marketplace/AccountNav";

export default async function AccountLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/enquiries");

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          <AccountNav />
          <div>{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
