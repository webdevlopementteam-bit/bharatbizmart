import Logo from "@/components/marketplace/Logo";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">{children}</main>
    </div>
  );
}
