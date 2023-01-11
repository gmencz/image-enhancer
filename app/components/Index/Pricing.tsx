import { CheckIcon } from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";

const tiers = [
  {
    id: "tier-free",
    name: "Free",
    href: "/login",
    description:
      "Perfect for small projects and personal usage (no credit card required).",
    features: [
      "30 monthly image enhancements",
      "Image colorizing and decolorizing",
      "Image deblurring, deraining, dehazing and retouching",
      "Image upscaling and fixing",
    ],
  },
  {
    id: "tier-pay-as-you-go",
    name: "Pay as you go",
    href: "/login",
    description:
      "Perfect for any type of project, you will only pay for what you use, nothing more.",
    features: [
      "Unlimited image enhancements",
      "Image colorizing and decolorizing",
      "Image deblurring, deraining, dehazing and retouching",
      "Image upscaling and fixing",
      "Image watermark removal",
      "Rest API",
      "Bulk enhancing",
    ],
  },
];

export function Pricing() {
  return (
    <div className="bg-gray-900" id="pricing">
      <div className="relative overflow-hidden pt-32 pb-96 lg:pt-40">
        <div>
          <img
            className="absolute bottom-0 left-1/2 w-[1440px] max-w-none -translate-x-1/2"
            src="/grid-blur-purple-on-black.jpg"
            alt=""
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className="text-lg font-semibold leading-8 text-purple-400">
              Pricing
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-white">
              The right price for you,{" "}
              <br className="hidden sm:inline lg:hidden" />
              whoever you are
            </p>
            <p className="mt-6 text-lg leading-8 text-white/60">
              Start for free and then pay only for what you use.
            </p>
          </div>
        </div>
      </div>
      <div className="flow-root bg-white pb-32 lg:pb-40">
        <div className="relative -mt-80">
          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2 lg:gap-8">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="flex flex-col rounded-3xl bg-white shadow-xl ring-1 ring-black/10"
                >
                  <div className="p-8 sm:p-10">
                    <h3
                      className="text-lg font-semibold leading-8 tracking-tight text-purple-600"
                      id={tier.id}
                    >
                      {tier.name}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-gray-600">
                      {tier.description}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col p-2">
                    <div className="flex flex-1 flex-col justify-between rounded-2xl bg-gray-50 p-6 sm:p-8">
                      <ul className="space-y-6">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <div className="flex-shrink-0">
                              <CheckIcon
                                className="h-6 w-6 text-purple-600"
                                aria-hidden="true"
                              />
                            </div>
                            <p className="ml-3 text-sm leading-6 text-gray-600">
                              {feature}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8">
                        <Link
                          to={tier.href}
                          className="inline-block w-full rounded-lg bg-purple-600 px-4 py-2.5 text-center text-sm font-semibold leading-5 text-white shadow-md hover:bg-purple-700"
                          aria-describedby={tier.id}
                        >
                          Get started today
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
