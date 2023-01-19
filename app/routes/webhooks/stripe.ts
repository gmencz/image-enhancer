import type { ActionArgs } from "@remix-run/node";
import { stripe } from "~/lib/stripe.server";
import { Stripe } from "stripe";
import invariant from "tiny-invariant";
import { prisma } from "~/lib/prisma.server";
import { getCreditsFromAmount } from "~/lib/utils.server";

export async function action({ request }: ActionArgs) {
  const { STRIPE_WEBHOOK_SECRET } = process.env;
  invariant(
    typeof STRIPE_WEBHOOK_SECRET === "string",
    "STRIPE_WEBHOOK_SECRET env var not set"
  );

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Webhook Error: Missing stripe-signature header", {
      status: 400,
    });
  }

  let event;
  const payload = await request.text();

  try {
    event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
      return new Response(`Webhook Error: ${err.message}`, {
        status: 400,
      });
    }

    return new Response(`Webhook Error: ${err}`, {
      status: 400,
    });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
    case "payment_intent.processing":
    case "payment_intent.payment_failed":
    case "payment_intent.canceled": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const creditsBought = getCreditsFromAmount(paymentIntent.amount);
      const userId = Number(paymentIntent.metadata.userId);
      const successfulPayment = await prisma.payment.findFirst({
        where: {
          AND: [{ paymentIntentId: paymentIntent.id }, { status: "succeeded" }],
        },
      });

      // If we have already stored the successful payment don't continue
      if (successfulPayment) {
        return new Response("ok");
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          credits:
            paymentIntent.status === "succeeded"
              ? { increment: creditsBought }
              : undefined,
          payments: {
            upsert: {
              where: {
                paymentIntentId: paymentIntent.id,
              },
              create: {
                amount: paymentIntent.amount,
                description: paymentIntent.description!,
                paymentIntentId: paymentIntent.id,
                status: paymentIntent.status,
              },
              update: {
                status: paymentIntent.status,
              },
            },
          },
        },
      });
    }
  }

  return new Response("ok");
}
