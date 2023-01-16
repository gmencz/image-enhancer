import { ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import type { ActionWithFormData } from "~/lib/responses.server";
import { ErrorToast } from "../ErrorToast";
import { SuccessToast } from "../SuccessToast";

export function SignInForm() {
  const actionData = useActionData<ActionWithFormData>();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";
  const isSuccess =
    !!actionData?.fieldValues &&
    !actionData.fieldErrors &&
    !actionData.formError;

  useEffect(() => {
    if (actionData?.fieldErrors?.email) {
      emailInputRef.current?.focus();
    }
  }, [actionData?.fieldErrors?.email]);

  useEffect(() => {
    if (isSuccess) {
      toast.custom(
        (t) => (
          <SuccessToast
            t={t}
            title="Check your inbox!"
            description={`We've sent you an email with the sign in link at ${actionData.fieldValues.email}.`}
          />
        ),
        {
          duration: Infinity,
        }
      );
    }
  }, [actionData?.fieldValues.email, isSuccess]);

  useEffect(() => {
    if (actionData?.formError) {
      toast.custom((t) => (
        <ErrorToast t={t} title="Oops!" description={actionData.formError!} />
      ));
    }
  }, [actionData]);

  return (
    <div className="sm:px-6 lg:px-8 pt-20 pb-32 sm:pt-36 flex-1">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="mx-auto h-12 w-auto" src="/logo.svg" alt="" />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/sign-up"
            className="font-medium text-purple-600 hover:text-purple-500"
          >
            create one for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form className="space-y-6" method="post">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  defaultValue={actionData?.fieldValues.email}
                  ref={emailInputRef}
                  aria-describedby={
                    actionData?.fieldErrors?.email ? "email-error" : undefined
                  }
                  aria-invalid={!!actionData?.fieldErrors?.email}
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className={clsx(
                    "block w-full appearance-none rounded-md border border-gray-300 pl-3 pr-10 py-2 placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm",
                    actionData?.fieldErrors?.email &&
                      "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {actionData?.fieldErrors?.email ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                ) : null}
              </div>

              <p className="mt-2 text-sm text-gray-500" id="email-description">
                We'll send you a link to sign in.
              </p>

              {actionData?.fieldErrors?.email ? (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {actionData.fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm disabled:bg-purple-300 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {isSubmitting ? "Sending you the link..." : "Send me the link"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
