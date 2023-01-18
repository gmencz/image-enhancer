import { CheckCircleIcon } from "@heroicons/react/20/solid";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { format } from "date-fns";
import { useMemo } from "react";
import { BuyCreditsSlideOver } from "~/components/AccountCredits/BuyCreditsSlideOver";
import { prisma } from "~/lib/prisma.server";
import { requireUserId } from "~/lib/session.server";
import { stripe } from "~/lib/stripe.server";
import { intSchema } from "~/lib/utils.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      payments: {
        select: {
          id: true,
          amount: true,
          description: true,
          createdAt: true,
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
      const paymentIntent = await stripe.paymentIntents.create({
        amount: cents,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return json({ user, paymentIntent });
    } catch (error) {
      console.error(error);
      return json({
        user,
        paymentIntent: null,
        error: "Error creating payment intent",
      });
    }
  }

  return json({ user, paymentIntent: null });
}

export type CreditsLoader = typeof loader;

export default function AccountCredits() {
  const { user } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const creditsBought = useMemo(() => {
    if (!searchParams.has("payment_success")) {
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
    searchParams.delete("payment_success");
    searchParams.delete("payment_credits");
    setSearchParams(searchParams);
  };

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

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
        ) : null}

        <section aria-labelledby="credits-details-heading">
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="bg-white shadow">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Credits
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Used for enhancing images, each image you enhance requires 1
                  credit.
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
                        <Link
                          to="?show_buy_credits_modal=yes"
                          className="rounded-md bg-white font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                          Buy more
                        </Link>
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {user.payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                              <time>
                                {format(
                                  new Date(payment.createdAt),
                                  "MMMM d, yyyy"
                                )}
                              </time>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {payment.description}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {formatter.format(payment.amount / 100)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
