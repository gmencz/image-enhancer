import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";
import { requireUserId } from "~/lib/session.server";
import { stripe } from "~/lib/stripe.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    throw redirect("/sign-out");
  }

  const url = new URL(request.url);
  const paymentIntentId = url.searchParams.get("payment_intent");
  if (!paymentIntentId) {
    return redirect("/app/account/credits?payment_error=true");
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!paymentIntent) {
    return redirect("/app/account/credits?payment_error=true");
  }

  const creditsBought = Math.round(paymentIntent.amount / 100 / 0.1);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      credits: { increment: creditsBought },
    },
  });

  return redirect(
    `/app/account/credits?payment_success=true&payment_credits=${creditsBought}`
  );
}
