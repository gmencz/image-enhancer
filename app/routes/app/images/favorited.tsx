import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ImageEnhancementsMasonry } from "~/components/ImageEnhancementsMasonry";
import { prisma } from "~/lib/prisma.server";
import { requireUserId } from "~/lib/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw redirect("/sign-out");
  }

  const imageEnhancements = await prisma.imageEnhancement.findMany({
    where: {
      AND: [{ userId: user.id }, { favorited: true }],
    },
    select: {
      id: true,
      effect: true,
      originalImageName: true,
      originalImageUrl: true,
      _count: { select: { results: true } },
    },
    orderBy: {
      id: "desc",
    },
  });

  return json({ imageEnhancements });
}

export default function Favorited() {
  const { imageEnhancements } = useLoaderData<typeof loader>();

  if (imageEnhancements.length === 0) {
    return (
      <p className="mt-1 text-sm text-gray-500">
        You haven't favorited any images yet.
      </p>
    );
  }

  return <ImageEnhancementsMasonry imageEnhancements={imageEnhancements} />;
}
