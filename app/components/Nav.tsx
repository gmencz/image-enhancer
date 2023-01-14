import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "@remix-run/react";
import { useState } from "react";

const navigation = [
  { name: "Features", href: "/#features" },
  { name: "Pricing", href: "/#pricing" },
];

interface NavProps {
  isSignedIn: boolean;
}

export function Nav({ isSignedIn }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="px-6 pt-6 md:px-8 min-h-[60px]">
      <nav
        className="flex h-9 items-center justify-between mx-auto max-w-3xl"
        aria-label="Global"
      >
        <div className="flex md:min-w-0 md:flex-1" aria-label="Global">
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Imxgic</span>
            <img className="h-8" src="/logo.svg" alt="" />
          </Link>
        </div>
        <div className="flex md:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden md:flex md:min-w-0 md:flex-1 md:justify-center md:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="font-semibold text-gray-900 hover:text-gray-900"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex md:min-w-0 md:flex-1 md:justify-end">
          <Link
            to={isSignedIn ? "/app/" : "/sign-in"}
            className="inline-block rounded-lg px-3 py-1.5 text-sm font-semibold leading-6 text-gray-900 shadow-sm ring-1 ring-gray-900/10 hover:ring-gray-900/20"
          >
            {isSignedIn ? "Open app" : "Sign in"}
          </Link>
        </div>
      </nav>
      <Dialog as="div" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <Dialog.Panel className="fixed inset-0 z-10 overflow-y-auto bg-white px-6 py-6 md:hidden">
          <div className="flex h-9 items-center justify-between">
            <div className="flex">
              <Link to="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Imxgic</span>
                <img className="h-8" src="/logo.svg" alt="" />
              </Link>
            </div>
            <div className="flex">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="-mx-3 block rounded-lg py-2 px-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-400/10"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <Link
                  to={isSignedIn ? "/app/" : "/sign-in"}
                  className="-mx-3 block rounded-lg py-2.5 px-3 text-base font-semibold leading-6 text-gray-900 hover:bg-gray-400/10"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
