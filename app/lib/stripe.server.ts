import { Stripe } from "stripe";
import invariant from "tiny-invariant";

const { STRIPE_SECRET_KEY } = process.env;
invariant(
  typeof STRIPE_SECRET_KEY === "string",
  "STRIPE_SECRET_KEY env var not set"
);

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export { stripe };
