import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/lib/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  return json({ userId });
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  return <p>User id: {data.userId}</p>;
}
