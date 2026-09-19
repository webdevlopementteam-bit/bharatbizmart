"use client";

let scriptPromise = null;

function loadCheckoutScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("Checkout can only run in the browser"));
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load the payment checkout script"));
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Opens Razorpay's hosted checkout modal for a server-created order and
 * resolves with the payment fields your backend needs to verify it, or
 * rejects if the user closes the modal or the payment fails.
 */
export async function openRazorpayCheckout({ order, keyId, name, description, prefill }) {
  await loadCheckoutScript();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: name || "BharatBizMart",
      description,
      prefill,
      theme: { color: "#f97316" },
      handler: (response) => resolve(response),
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    });
    rzp.on("payment.failed", (response) => reject(new Error(response?.error?.description || "Payment failed")));
    rzp.open();
  });
}
