import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";
import { stripe } from "~/lib/stripe.server";
import { getCreditsFromAmount } from "~/lib/utils.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const paymentIntentId = url.searchParams.get("payment_intent");
  if (!paymentIntentId) {
    return redirect("/app/account/credits?payment_failed=true");
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!paymentIntent) {
    return redirect("/app/account/credits?payment_failed=true");
  }

  const creditsBought = getCreditsFromAmount(paymentIntent.amount);
  const successfulPayment = await prisma.payment.findFirst({
    where: {
      AND: [{ paymentIntentId: paymentIntent.id }, { status: "succeeded" }],
    },
  });

  // If we have already stored the successful payment don't continue
  if (successfulPayment) {
    return redirect(
      `/app/account/credits?payment_succeeded=true&payment_credits=${creditsBought}`
    );
  }

  const user = await prisma.user.update({
    where: { id: Number(paymentIntent.metadata.userId) },
    data: {
      stripeCustomerId:
        paymentIntent.status === "succeeded"
          ? paymentIntent.customer?.toString()
          : undefined,
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
    select: {
      stripeCustomerId: true,
    },
  });

  switch (paymentIntent.status) {
    case "succeeded": {
      if (user.stripeCustomerId) {
        const invoice = await stripe.invoices.create({
          customer: user.stripeCustomerId,
          currency: paymentIntent.currency,
        });

        await stripe.invoiceItems.create({
          customer: user.stripeCustomerId,
          amount: paymentIntent.amount,
          description: paymentIntent.description || undefined,
          currency: paymentIntent.currency,
          invoice: invoice.id,
        });
      }

      return redirect(
        `/app/account/credits?payment_succeeded=true&payment_credits=${creditsBought}`
      );
    }

    case "processing": {
      return redirect("/app/account/credits?payment_processing=true");
    }

    default: {
      return redirect("/app/account/credits?payment_failed=true");
    }
  }
}
