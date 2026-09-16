import { redirect } from "next/navigation";

// "Companies" and "Suppliers" are the same underlying business directory —
// canonicalized to /suppliers to avoid duplicate content for SEO.
export default async function CompaniesPage({ searchParams }) {
  const sp = await searchParams;
  const qs = new URLSearchParams(sp).toString();
  redirect(`/suppliers${qs ? `?${qs}` : ""}`);
}
