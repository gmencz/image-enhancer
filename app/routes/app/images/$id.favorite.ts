import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";
import { redirectBack } from "~/lib/responses.server";
import { intSchema } from "~/lib/utils.server";

export async function action({ request, params }: ActionArgs) {
  const idParam = params.id;
  if (!idParam) {
    return json({ error: "Invalid params" }, { status: 400 });
  }

  let id;
  try {
    id = intSchema.parse(idParam);
  } catch (error) {
    if (!idParam) {
      return json({ error: "Invalid params" }, { status: 400 });
    }
  }

  await prisma.imageEnhancement.update({
    where: {
      id,
    },
    data: {
      favorited: { set: true },
    },
  });

  return redirectBack(request, { fallback: "/app/images" });
}
