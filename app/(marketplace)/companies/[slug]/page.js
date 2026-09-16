import { redirect } from "next/navigation";

export default async function CompanyDetailRedirect({ params }) {
  const { slug } = await params;
  redirect(`/suppliers/${slug}`);
}
