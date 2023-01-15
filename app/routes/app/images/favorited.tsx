import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";
import { requireUser } from "~/lib/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  const imageEnhancements = await prisma.imageEnhancement.findMany({
    where: {
      AND: [{ userId: user.id }, { favorited: true }],
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

export default function Favorited() {
  return <p>Favorited</p>;
}
