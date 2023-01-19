import type { Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(window.ENV.STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

const elementsOptions: Partial<StripeElementsOptions> = {
  fonts: [
    {
      // Possible improvement: use our domain instead of google apis. For local dev we could use ngrok since this can only be
      // served over https.
      cssSrc:
        "https://fonts.googleapis.com/css?family=Inter:300,300i,400,500,600",
      family: "Inter",
      style: "normal",
    },
  ],
  appearance: {
    theme: "none",
    variables: {
      fontFamily:
        "Inter, ui-sans-serif,system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif,'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    },
    rules: {
      ".Label": {
        color: "rgb(55, 65, 81)",
        fontWeight: "500",
        fontSize: ".875rem",
        lineHeight: "1.25rem",
      },
      ".Input": {
        fontSize: ".875rem",
        lineHeight: "1.25rem",
        boxShadow:
          "0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / .05)",
        borderColor: "rgb(209, 213, 219)",
        borderRadius: "0.375rem",
        width: "100%",
        display: "block",
        borderWidth: "1px",
        borderStyle: "solid",
        padding: "0.5rem 0.75rem",
        appearance: "none",
        outline: "none",
        backgroundColor: "#fff",
        transition: "none",
      },
      ".Input:focus": {
        borderColor: "rgb(168, 85, 247)",
        boxShadow:
          "rgb(255, 255, 255) 0px 0px 0px 0px, rgb(168, 85, 247) 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px",
      },
      ".Input--invalid": {
        borderColor: "rgb(252, 165, 165)",
        color: "rgb(127, 29, 29)",
      },
      ".Input--invalid:focus": {
        borderColor: "rgb(239, 68, 68)",
        boxShadow:
          "rgb(255, 255, 255) 0px 0px 0px 0px, rgb(239, 68, 68) 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px",
      },
    },
  },
};

export { getStripe, elementsOptions };
