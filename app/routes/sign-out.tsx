import type { LoaderArgs } from "@remix-run/node";
import { signOut } from "~/lib/session.server";

export async function loader({ request }: LoaderArgs) {
  return await signOut(request);
}
