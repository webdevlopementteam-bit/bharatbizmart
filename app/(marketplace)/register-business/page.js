import SellerOnboardingWizard from "@/components/vendor/SellerOnboardingWizard";

export const metadata = {
  title: "Register Your Business",
  description: "List your business, get your own website, and start receiving buyer enquiries.",
};

export default function RegisterBusinessPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Register Your Business</h1>
          <p className="mt-2 text-sm text-slate-500">
            Get a free business profile, your own auto-generated website, and start receiving leads from buyers.
          </p>
        </div>
        <SellerOnboardingWizard />
      </div>
    </div>
  );
}
