import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { NavLink, Outlet } from "@remix-run/react";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const navigation = [
  { name: "Enhancer", href: "/app", end: true },
  { name: "Images", href: "/app/images", end: false },
];

const userNavigation = [
  { name: "Your Account", href: "/app/account" },
  { name: "Sign out", href: "/sign-out" },
];

export default function App() {
  return (
    <>
      <div className="min-h-full flex flex-col">
        <Disclosure as="nav" className="border-b border-gray-200 bg-white">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                  <div className="flex">
                    <div className="flex flex-shrink-0 items-center">
                      <img
                        className="block h-8 w-auto"
                        src="/logo.svg"
                        alt="Imxgic"
                      />
                    </div>
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                      {navigation.map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          end={item.end}
                          className={({ isActive }) =>
                            clsx(
                              isActive
                                ? "border-purple-500 text-purple-500"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                              "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            )
                          }
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <div className="rounded-full h-10 w-10 bg-purple-100 flex items-center justify-center font-bold">
                            <UserCircleIcon className="h-7 w-7 text-purple-900" />
                          </div>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <a
                                  href={item.href}
                                  className={clsx(
                                    active ? "bg-gray-100" : "",
                                    "block px-4 py-2 text-sm text-gray-700"
                                  )}
                                >
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  <div className="-mr-2 flex items-center sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="space-y-1 pt-2 pb-3">
                  {navigation.map((item) => (
                    <Disclosure.Button key={item.name} as={Fragment}>
                      <NavLink
                        to={item.href}
                        end={item.end}
                        className={({ isActive }) =>
                          clsx(
                            isActive
                              ? "bg-purple-50 border-purple-500 text-purple-700"
                              : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                            "block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                          )
                        }
                      >
                        {item.name}
                      </NavLink>
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="flex items-center px-4">
                    <button
                      type="button"
                      className="flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <Outlet />
      </div>
    </>
  );
}
