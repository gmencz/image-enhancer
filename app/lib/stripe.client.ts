import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(window.ENV.STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

export { getStripe };
