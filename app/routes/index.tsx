import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Footer } from "~/components/Footer";
import { Features } from "~/components/Index/Features";
import { Gradient } from "~/components/Index/Gradient";
import { Hero } from "~/components/Index/Hero";
import { Pricing } from "~/components/Index/Pricing";
import { Nav } from "~/components/Nav";
import { getUserId } from "~/lib/session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  return json({ userId });
}

export default function Index() {
  const { userId } = useLoaderData<typeof loader>();
  const isSignedIn = !!userId;

  return (
    <div className="isolate bg-white">
      <Gradient />
      <Nav isSignedIn={isSignedIn} />
      <main>
        <Hero isSignedIn={isSignedIn} />
        <Features isSignedIn={isSignedIn} />
        <Pricing isSignedIn={isSignedIn} />
        <Footer />
      </main>
    </div>
  );
}
