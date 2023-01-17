import { CogIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { NavLink, Outlet } from "@remix-run/react";

const navigation = [
  { name: "Account", href: "/app/account", icon: CogIcon, end: true },
  {
    name: "Credits & Billing",
    href: "/app/account/credits",
    icon: CreditCardIcon,
    end: false,
  },
];

export default function Account() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        <aside className="pb-6 px-2 sm:px-6 lg:col-span-3 lg:py-0 lg:px-0">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                end={item.end}
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    isActive
                      ? "bg-purple-50 border-purple-600 text-purple-600"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group border-l-4 py-2 px-3 flex items-center sm:text-sm font-medium"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={clsx(
                        isActive
                          ? "text-purple-500"
                          : "text-gray-400 group-hover:text-gray-500",
                        "flex-shrink-0 -ml-1 mr-3 h-6 w-6"
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <Outlet />
      </div>
    </main>
  );
}
