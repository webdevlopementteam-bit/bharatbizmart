"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import clsx from "clsx";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/AuthProvider";
import { getVendorSiteHost } from "@/lib/utils/vendorUrl";
import { openRazorpayCheckout } from "@/lib/payments/razorpayCheckout";

const steps = ["Account", "Business Info", "Location", "Categories", "Description", "Plan & Review"];

const businessTypes = [
  "manufacturer", "supplier", "distributor", "wholesaler", "retailer", "dealer", "exporter", "service_provider",
];

const plans = [
  { key: "free", name: "Free", price: "₹0/mo", features: ["Basic profile", "Up to 10 products", "20 leads/mo", "Basic website"] },
  { key: "growth", name: "Growth", price: "₹999/mo", features: ["50 products", "100 leads/mo", "Analytics", "Custom branding"] },
  { key: "premium", name: "Premium", price: "₹2499/mo", features: ["Unlimited products", "Priority leads", "Custom domain", "Premium templates"] },
  { key: "enterprise", name: "Enterprise", price: "Contact us", features: ["Multi-branch", "Advanced CRM", "API access", "Dedicated support"] },
];

export default function SellerOnboardingWizard() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    account: { name: "", email: "", phone: "", password: "" },
    business: { businessName: "", businessType: "manufacturer", gstNumber: "", panNumber: "", registrationNumber: "", establishedYear: "" },
    location: { address: "", city: "", state: "", country: "India", pincode: "" },
    categories: [],
    description: "",
    plan: "free",
  });

  useEffect(() => {
    fetch("/api/categories?parent=root").then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  const update = (section, field) => (e) =>
    setForm((f) => ({ ...f, [section]: { ...f[section], [field]: e.target.value } }));

  const toggleCategory = (id) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(id) ? f.categories.filter((c) => c !== id) : [...f.categories, id],
    }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.account.name || !form.account.email || !form.account.password) {
        toast.error("Please fill in all required account fields");
        return false;
      }
    }
    if (step === 1 && (!form.business.businessName || !form.business.businessType)) {
      toast.error("Business name and type are required");
      return false;
    }
    if (step === 2 && (!form.location.city || !form.location.state)) {
      toast.error("City and state are required");
      return false;
    }
    return true;
  };

  const next = () => validateStep() && setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/vendors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Registration failed");
      await refresh();
      toast.success("Business registered! Your website is being set up.");

      // Registration always creates the account on the free plan — a paid
      // plan picked in this step is only granted after real payment, so
      // trigger that now the vendor account (and auth session) exist.
      // Cancelling/failing payment here doesn't block onboarding: they land
      // on the dashboard on the free plan and can upgrade any time.
      if (form.plan !== "free") {
        try {
          await upgradeToSelectedPlan(form.plan, data.user);
          toast.success(`Payment successful — you're on the ${form.plan} plan!`);
        } catch (paymentErr) {
          toast.error(paymentErr.message || "Payment was not completed — you're on the Free plan for now.");
        }
      }

      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const upgradeToSelectedPlan = async (planKey, registeredUser) => {
    const checkoutRes = await fetch("/api/vendor/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey }),
    });
    const checkoutData = await checkoutRes.json();
    if (!checkoutRes.ok || !checkoutData.success) throw new Error(checkoutData.message || "Could not start checkout");
    if (checkoutData.activated) return; // no Razorpay key configured — already active

    const paymentResponse = await openRazorpayCheckout({
      order: checkoutData.order,
      keyId: checkoutData.keyId,
      name: "BharatBizMart",
      description: `${planKey} plan subscription`,
      prefill: { name: registeredUser?.name, email: registeredUser?.email },
    });

    const verifyRes = await fetch("/api/vendor/subscription/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: checkoutData.paymentId, ...paymentResponse }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.success) throw new Error(verifyData.message || "Payment verification failed");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <ol className="mb-8 flex flex-wrap items-center gap-2 text-xs">
        {steps.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={clsx(
                "flex h-6 w-6 items-center justify-center rounded-full font-semibold",
                i < step ? "bg-emerald-500 text-white" : i === step ? "bg-brand text-white" : "bg-slate-200 text-slate-500"
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={clsx(i === step ? "font-semibold text-slate-900" : "text-slate-500")}>{label}</span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-4 bg-slate-200" />}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8">
        {step === 0 && (
          <Grid>
            <Field label="Full Name *" value={form.account.name} onChange={update("account", "name")} />
            <Field label="Email *" type="email" value={form.account.email} onChange={update("account", "email")} />
            <Field label="Mobile Number *" value={form.account.phone} onChange={update("account", "phone")} />
            <Field label="Password *" type="password" value={form.account.password} onChange={update("account", "password")} />
          </Grid>
        )}

        {step === 1 && (
          <Grid>
            <Field label="Business Name *" value={form.business.businessName} onChange={update("business", "businessName")} />
            <div>
              <label className="text-xs font-medium text-slate-600">Business Type *</label>
              <select
                value={form.business.businessType}
                onChange={update("business", "businessType")}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {businessTypes.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <Field label="GST Number" value={form.business.gstNumber} onChange={update("business", "gstNumber")} />
            <Field label="PAN Number" value={form.business.panNumber} onChange={update("business", "panNumber")} />
            <Field label="Registration Number" value={form.business.registrationNumber} onChange={update("business", "registrationNumber")} />
            <Field label="Established Year" type="number" value={form.business.establishedYear} onChange={update("business", "establishedYear")} />
          </Grid>
        )}

        {step === 2 && (
          <Grid>
            <Field label="Address" value={form.location.address} onChange={update("location", "address")} className="sm:col-span-2" />
            <Field label="City *" value={form.location.city} onChange={update("location", "city")} />
            <Field label="State *" value={form.location.state} onChange={update("location", "state")} />
            <Field label="Country" value={form.location.country} onChange={update("location", "country")} />
            <Field label="Pincode" value={form.location.pincode} onChange={update("location", "pincode")} />
          </Grid>
        )}

        {step === 3 && (
          <div>
            <p className="mb-3 text-sm text-slate-500">Select the categories your business deals in.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => toggleCategory(c._id)}
                  className={clsx(
                    "rounded-lg border px-3 py-2 text-left text-sm",
                    form.categories.includes(c._id) ? "border-brand bg-brand/5 text-brand" : "border-slate-200 text-slate-600"
                  )}
                >
                  {c.name}
                </button>
              ))}
              {categories.length === 0 && <p className="text-sm text-slate-400">Loading categories...</p>}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <label className="text-xs font-medium text-slate-600">Business Description</label>
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Tell buyers about your business, products, manufacturing capacity, etc."
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-3 text-xs text-slate-400">
              You can upload your logo, cover image, product photos and verification documents from your dashboard right after registration.
            </p>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {plans.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, plan: p.key }))}
                  className={clsx(
                    "rounded-xl border p-4 text-left",
                    form.plan === p.key ? "border-brand ring-2 ring-brand/20" : "border-slate-200"
                  )}
                >
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-sm text-brand">{p.price}</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-500">
                    {p.features.map((f) => <li key={f}>• {f}</li>)}
                  </ul>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-800">Your business website will be:</p>
              <p className="mt-1 font-mono text-brand">
                {getVendorSiteHost((form.business.businessName || "your-business").toLowerCase().replace(/[^a-z0-9]+/g, "-"))}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={back} disabled={step === 0}>Back</Button>
          {step < steps.length - 1 ? (
            <Button onClick={next}>Continue</Button>
          ) : (
            <Button onClick={submit} disabled={submitting} variant="accent">
              {submitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({ label, type = "text", value, onChange, className }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}
