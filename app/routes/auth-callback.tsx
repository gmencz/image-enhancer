import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { parseTokenFromEmail } from "~/lib/mail.server";
import { createUserSession } from "~/lib/session.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return redirect("/sign-in");
  }

  try {
    const { userId } = await parseTokenFromEmail(token);
    return await createUserSession(userId, "/app");
  } catch (error) {
    console.error(error);
    return redirect("/sign-in");
  }
}
