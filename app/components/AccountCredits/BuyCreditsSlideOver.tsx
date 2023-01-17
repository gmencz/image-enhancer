import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { Fragment, useRef, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import type { CreditsLoader } from "~/routes/app/account/credits";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { getStripe } from "~/lib/stripe.client";
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid";
import { Spinner } from "../Spinner";

function BuyCreditsCheckoutForm() {
  const { paymentIntent } = useLoaderData<CreditsLoader>();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount");
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const elements = useElements();
  const stripe = useStripe();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!!elements && !!stripe) {
      setProcessing(true);
      try {
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url:
              "http://localhost:3000/app/account/credits/payment-callback",
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Link
        className="flex items-center gap-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md"
        to={`/app/account/credits?show_buy_credits_modal=yes&amount=${searchParams.get(
          "amount"
        )}`}
      >
        <ArrowLongLeftIcon className="w-6 h-6 text-gray-900" />
        <span className="text-sm text-gray-900 font-medium">
          Return to amount selection
        </span>
      </Link>

      <PaymentElement />

      <button
        type="submit"
        disabled={processing}
        className="mt-8 flex flex-1 w-full disabled:bg-purple-300 justify-center rounded-md border border-transparent bg-purple-600 px-6 py-3 sm:text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        {processing ? (
          <>
            <Spinner
              className="-ml-1 mr-3 h-5 w-5 text-white"
              aria-hidden="true"
            />
            Pay {formatter.format(paymentIntent!.amount / 100)} for {amount}{" "}
            credits
          </>
        ) : (
          <>
            Pay {formatter.format(paymentIntent!.amount / 100)} for {amount}{" "}
            credits
          </>
        )}
      </button>
    </Form>
  );
}

function BuyCreditsCheckout() {
  const { paymentIntent } = useLoaderData<CreditsLoader>();
  const stripePromise = getStripe();

  return (
    <div className="relative mt-6 flex-1 px-4 sm:px-6">
      {paymentIntent?.client_secret ? (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret: paymentIntent.client_secret }}
        >
          <BuyCreditsCheckoutForm />
        </Elements>
      ) : null}
    </div>
  );
}

interface BuyCreditsFormProps {
  amountInputRef: React.RefObject<HTMLInputElement>;
}

function BuyCreditsForm({ amountInputRef }: BuyCreditsFormProps) {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(() => {
    const amountParam = Number(searchParams.get("amount"));
    const isValidParam =
      !Number.isNaN(amountParam) && amountParam >= 10 && amountParam <= 1000000;
    return {
      amount: isValidParam ? amountParam : 10,
    };
  });

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      amount: Number(e.target.value),
    }));
  };

  const canSubmit = formData.amount >= 10 && formData.amount <= 1000000;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const total = formData.amount * 0.1;

  return (
    <Form className="relative mt-6 flex-1 px-4 sm:px-6" method="get">
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount
        </label>

        <input type="hidden" name="show_buy_credits_modal" value="yes" />
        <input type="hidden" name="checkout" value="yes" />

        <div className="mt-1">
          <input
            type="number"
            name="amount"
            id="amount"
            ref={amountInputRef}
            value={formData.amount}
            onChange={(e) => onAmountChange(e)}
            required
            min={10}
            max={1000000}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            aria-describedby="amount-description"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500" id="amount-description">
          The amount of credits you want to buy. 1 credit allows you to enhance
          1 image. Minimum 10.
        </p>
      </div>

      <div className="border-t border-gray-200 mt-6 pt-4">
        <div className="flex justify-between sm:text-sm font-medium text-gray-900">
          <p>Total</p>
          <p>{formatter.format(total)}</p>
        </div>
      </div>

      <div className="mt-6 flex">
        <button
          type="submit"
          className="flex flex-1 w-full disabled:bg-purple-300 justify-center rounded-md border border-transparent bg-purple-600 px-6 py-3 sm:text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          disabled={!canSubmit}
        >
          Continue
        </button>
      </div>
    </Form>
  );
}

export function BuyCreditsSlideOver() {
  const [searchParams, setSearchParams] = useSearchParams();
  const show = searchParams.has("show_buy_credits_modal");
  const amountInputRef = useRef<HTMLInputElement>(null);
  const { paymentIntent } = useLoaderData<CreditsLoader>();

  const close = () => {
    searchParams.delete("show_buy_credits_modal");
    setSearchParams(searchParams);
  };

  return (
    <Transition.Root appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={close}
        initialFocus={amountInputRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={close}
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex h-full flex-col overflow-y-scroll bg-white pb-6 shadow-xl">
                    <div className="bg-purple-700 py-6 px-4 sm:px-6">
                      <Dialog.Title className="text-lg font-medium text-white">
                        Buy credits
                      </Dialog.Title>
                      <div className="mt-1">
                        <p className="text-sm text-purple-300">
                          The credits will be instantly available after
                          completing your payment.
                        </p>
                      </div>
                    </div>

                    {paymentIntent ? (
                      <BuyCreditsCheckout />
                    ) : (
                      <BuyCreditsForm amountInputRef={amountInputRef} />
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
