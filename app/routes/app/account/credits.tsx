import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { toast, useToaster } from "react-hot-toast";
import { BuyCreditsSlideOver } from "~/components/AccountCredits/BuyCreditsSlideOver";
import { SuccessToast } from "~/components/SuccessToast";
import { prisma } from "~/lib/prisma.server";
import { requireUserId } from "~/lib/session.server";
import { stripe } from "~/lib/stripe.server";
import { intSchema } from "~/lib/utils.server";

const payments = [
  {
    id: 1,
    date: "1/1/2020",
    datetime: "2020-01-01",
    description: "Business Plan - Annual Billing",
    amount: "$109.00",
    href: "#",
  },
];

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
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
  const [searchParams] = useSearchParams();
  const boughtCredits =
    searchParams.has("payment_success") && searchParams.has("payment_credits");

  // Show some info that credits were just added and also handle errors with the payment.

  return (
    <>
      <BuyCreditsSlideOver />

      <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
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
                          {/*
                                  `relative` is added here due to a weird bug in Safari that causes `sr-only` headings to introduce overflow on the body on mobile.
                                */}
                          <th
                            scope="col"
                            className="relative px-6 py-3 text-left text-sm font-medium text-gray-500"
                          >
                            <span className="sr-only">View receipt</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                              <time dateTime={payment.datetime}>
                                {payment.date}
                              </time>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {payment.description}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {payment.amount}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                              <a
                                href={payment.href}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                View receipt
                              </a>
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
