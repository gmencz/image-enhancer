import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Toaster } from "react-hot-toast";
import styles from "./styles/app.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Imxgic",
  viewport: "width=device-width,initial-scale=1",
});

declare global {
  interface Window {
    ENV: {
      STRIPE_PUBLIC_KEY: string;
    };
  }
}

export async function loader() {
  return json({
    ENV: {
      STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    },
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <html className="h-full bg-gray-50" lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
