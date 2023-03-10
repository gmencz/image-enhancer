import { NavLink, Outlet, useLocation, useNavigate } from "@remix-run/react";
import clsx from "clsx";
import { Select } from "~/components/Select";
import { useState } from "react";
import { ImageSlideOver } from "~/components/ImageSlideOver";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

const tabs = [
  { name: "Recently Added", href: "/app/images" },
  { name: "Favorited", href: "/app/images/favorited" },
];

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const showImageIdParam = url.searchParams.get("show_image_id");
  if (showImageIdParam) {
    const showImageId = +showImageIdParam;
    if (Number.isNaN(showImageId)) {
      return json(
        { error: "Invalid show_image_id param", slideOverImage: null },
        { status: 400 }
      );
    }

    const imageEnhancement = await prisma.imageEnhancement.findUnique({
      where: { id: showImageId },
      select: {
        id: true,
        effect: true,
        favorited: true,
        originalImageName: true,
        originalImageUrl: true,
        createdAt: true,
        timeMetric: true,
        results: {
          select: {
            id: true,
            model: true,
            url: true,
          },
        },
      },
    });

    return json({ slideOverImage: imageEnhancement });
  }

  return json({ slideOverImage: null });
}

export type ImagesLoader = typeof loader;

export default function Images() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileSelectedTab, setMobileSelectedTab] = useState(
    tabs.find((tab) => pathname.startsWith(tab.href))!.name
  );

  return (
    <main>
      <ImageSlideOver />

      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="flex">
          <h1 className="flex-1 text-3xl font-bold text-gray-900">Images</h1>
        </div>

        {/* Tabs */}
        <div className="mt-3 sm:mt-2">
          <div className="sm:hidden">
            <Select
              label="Select a tab"
              labelClassName="sr-only"
              options={tabs.map((tab) => tab.name)}
              selected={mobileSelectedTab}
              setSelected={setMobileSelectedTab}
              onChange={(selected) => {
                const tab = tabs.find((t) => t.name === selected)!;
                navigate(tab.href);
              }}
            />
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="flex items-center border-b border-gray-200">
            <nav
              className="-mb-px flex flex-1 space-x-6 xl:space-x-8"
              aria-label="Tabs"
            >
              {tabs.map((tab) => (
                <NavLink
                  key={tab.name}
                  to={tab.href}
                  end
                  className={({ isActive }) =>
                    clsx(
                      isActive
                        ? "border-purple-500 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                      "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                    )
                  }
                >
                  {tab.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-4">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
