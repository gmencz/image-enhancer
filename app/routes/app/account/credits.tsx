import {
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { format } from "date-fns";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { BuyCreditsSlideOver } from "~/components/AccountCredits/BuyCreditsSlideOver";
import { prisma } from "~/lib/prisma.server";
import { requireUserId } from "~/lib/session.server";
import { stripe } from "~/lib/stripe.server";
import { intSchema } from "~/lib/utils.server";

export async function loader({ request }: LoaderArgs) {
  const { STRIPE_CUSTOMER_PORTAL_LINK } = process.env;
  invariant(
    typeof STRIPE_CUSTOMER_PORTAL_LINK === "string",
    "STRIPE_CUSTOMER_PORTAL_LINK env var not set"
  );

  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      stripeCustomerId: true,
      email: true,
      credits: true,
      payments: {
        select: {
          id: true,
          amount: true,
          description: true,
          createdAt: true,
          status: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    throw redirect("/sign-out");
  }

  const url = new URL(request.url);
  const wantsToBuyCredits =
    url.searchParams.has("show_buy_credits_modal") &&
    url.searchParams.has("amount") &&
    url.searchParams.has("checkout");

  if (wantsToBuyCredits) {
    const amount = url.searchParams.get("amount");
    try {
      const amountNumber = intSchema.parse(amount);
      const total = amountNumber * 0.1;
      const cents = Math.round(total * 100);

      if (user.stripeCustomerId) {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: user.stripeCustomerId,
          type: "card",
        });

        if (paymentMethods.data.length) {
          const paymentIntent = await stripe.paymentIntents.create({
            customer: user.stripeCustomerId,
            amount: cents,
            currency: "usd",
            description: `${amountNumber} credits`,
            metadata: {
              userId,
            },
            receipt_email: user.email,
            payment_method: paymentMethods.data[0].id,
            off_session: true,
            confirm: true,
          });

          return redirect(
            `/app/account/credits/payment-callback?payment_intent=${paymentIntent.id}`
          );
        }

        const paymentIntent = await stripe.paymentIntents.create({
          customer: user.stripeCustomerId,
          setup_future_usage: "off_session",
          amount: cents,
          currency: "usd",
          description: `${amountNumber} credits`,
          metadata: {
            userId,
          },
          receipt_email: user.email,
          automatic_payment_methods: {
            enabled: true,
          },
        });

        return json({
          user,
          paymentIntent,
          customerPortalLink: STRIPE_CUSTOMER_PORTAL_LINK,
        });
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
        });

        const paymentIntent = await stripe.paymentIntents.create({
          customer: customer.id,
          setup_future_usage: "off_session",
          amount: cents,
          currency: "usd",
          description: `${amountNumber} credits`,
          metadata: {
            userId,
          },
          receipt_email: user.email,
          automatic_payment_methods: {
            enabled: true,
          },
        });

        return json({
          user,
          paymentIntent,
          customerPortalLink: STRIPE_CUSTOMER_PORTAL_LINK,
        });
      }
    } catch (error) {
      console.error(error);
      return json({
        user,
        paymentIntent: null,
        error: "Error creating payment intent",
        customerPortalLink: STRIPE_CUSTOMER_PORTAL_LINK,
      });
    }
  }

  return json({
    user,
    paymentIntent: null,
    customerPortalLink: STRIPE_CUSTOMER_PORTAL_LINK,
  });
}

export type CreditsLoader = typeof loader;

export default function AccountCredits() {
  const { user, customerPortalLink } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentError = searchParams.has("payment_failed");
  const paymentProcessing = searchParams.has("payment_processing");
  const creditsBought = useMemo(() => {
    if (!searchParams.has("payment_succeeded")) {
      return 0;
    }

    const creditsBought = searchParams.get("payment_credits");
    const creditsBoughtNumber = Number(creditsBought);
    if (Number.isNaN(creditsBoughtNumber)) {
      return 0;
    }

    if (creditsBoughtNumber >= 10 && creditsBoughtNumber <= 1000000) {
      return creditsBoughtNumber;
    }

    return 0;
  }, [searchParams]);

  const closeCreditsBoughtAlert = () => {
    searchParams.delete("payment_succeeded");
    searchParams.delete("payment_credits");
    setSearchParams(searchParams);
  };

  const closePaymentErrorAlert = () => {
    searchParams.delete("payment_failed");
    setSearchParams(searchParams);
  };

  const closePaymentProcessingAlert = () => {
    searchParams.delete("payment_processing");
    setSearchParams(searchParams);
  };

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const paymentStatusTexts = {
    succeeded: "Succeeded",
    processing: "Processing",
    canceled: "Canceled",
  };

  const getPaymentStatusText = (paymentStatus: string) => {
    return (
      paymentStatusTexts[paymentStatus as keyof typeof paymentStatusTexts] ||
      "Failed"
    );
  };

  return (
    <>
      <BuyCreditsSlideOver />

      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
        {creditsBought ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon
                  className="h-5 w-5 text-green-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Credits added
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your payment was successful and {creditsBought} credits have
                    been added to your account.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      onClick={closeCreditsBoughtAlert}
                      className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : paymentError ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Payment error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p className="text-sm">
                    Something went wrong with your payment and we couldn't add
                    the credits to your account.
                  </p>
                </div>

                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      onClick={closePaymentErrorAlert}
                      className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : paymentProcessing ? (
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <InformationCircleIcon
                  className="h-5 w-5 text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3 flex-1 flex-col">
                <p className="text-sm text-blue-700">
                  Your payment is being processed, if successful, the credits
                  will be added to your account automatically.
                </p>

                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      onClick={closePaymentProcessingAlert}
                      className="rounded-md bg-blue-50 px-2 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <section aria-labelledby="credits-details-heading">
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="bg-white shadow">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Credits
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Used for enhancing images, 1 credit per image.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Current balance
                    </dt>
                    <dd className="mt-1 flex text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      <span className="flex-grow">
                        {user.credits}{" "}
                        {user.credits === 1 ? "credit" : "credits"}
                      </span>
                      <span className="ml-4 flex-shrink-0">
                        <button
                          onClick={() => {
                            searchParams.delete("show_buy_credits_modal");
                            searchParams.append(
                              "show_buy_credits_modal",
                              "true"
                            );
                            setSearchParams(searchParams);
                          }}
                          className="rounded-md bg-white font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                          Buy more
                        </button>
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="billing-history-heading">
          <div className="bg-white pt-6 shadow sm:overflow-hidden sm:rounded-md">
            <div className="px-4 sm:px-6">
              <h2
                id="billing-history-heading"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Billing history
              </h2>
            </div>
            <div className="mt-6 flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden border-t border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                          >
                            Description
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                          >
                            Payment
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {user.payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                              <time>
                                {format(
                                  new Date(payment.createdAt),
                                  "M'/'d'/'yyyy"
                                )}
                              </time>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {payment.description}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {formatter.format(payment.amount / 100)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {getPaymentStatusText(payment.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="py-5 px-6 border-t border-t-gray-200">
              <a
                href={customerPortalLink}
                className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Manage payment
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
