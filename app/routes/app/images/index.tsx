import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/prisma.server";
import { requireUser } from "~/lib/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  const imageEnhancements = await prisma.imageEnhancement.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      effect: true,
      originalImageName: true,
      originalImageUrl: true,
      results: {
        select: {
          id: true,
          url: true,
        },
      },
    },
    take: 20,
  });

  return json({ imageEnhancements });
}

export default function RecentlyAdded() {
  const { imageEnhancements } = useLoaderData<typeof loader>();
  console.log({ imageEnhancements });

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-3 xl:gap-x-8">
      {imageEnhancements.map((imageEnhancement) => (
        <li key={imageEnhancement.id} className="relative">
          <div
            className={
              "focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 overflow-hidden"
            }
          >
            <img
              src={imageEnhancement.results[0].url}
              alt={`Result 1`}
              className={
                "group-hover:opacity-75 object-cover pointer-events-none"
              }
            />
            <Link
              to={`/app/images/${imageEnhancement.id}`}
              className="absolute inset-0 focus:outline-none"
            >
              <span className="sr-only">
                View details for {imageEnhancement.originalImageName}
              </span>
            </Link>
          </div>
          <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">
            {imageEnhancement.originalImageName}
          </p>
          <p className="pointer-events-none block text-sm font-medium text-gray-500">
            {imageEnhancement.effect} -{" "}
            {imageEnhancement.results.length === 1
              ? `1 result`
              : `${imageEnhancement.results.length} results`}
          </p>
        </li>
      ))}
    </ul>
  );
}
