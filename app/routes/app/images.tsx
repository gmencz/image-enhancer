import type { LoaderArgs } from "@remix-run/node";
import { requireUser } from "~/lib/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  console.log({ user });

  return null;
}

export default function Images() {
  return null;
}
