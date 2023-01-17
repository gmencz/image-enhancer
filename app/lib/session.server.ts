import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

const { SESSION_SECRET } = process.env;
invariant(typeof SESSION_SECRET === "string", "SESSION_SECRET env var not set");

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secrets: [SESSION_SECRET],
      secure: process.env.NODE_ENV === "production",
    },
  });

function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "number") return null;
  return userId;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "number") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/sign-in?${searchParams}`);
  }
  return userId;
}

export async function createUserSession(userId: number, redirectTo: string) {
  const session = await getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function signOut(request: Request) {
  const session = await getUserSession(request);
  return redirect("/sign-in", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export { getSession, commitSession, destroySession };
