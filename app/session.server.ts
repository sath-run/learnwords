import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userName";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserName(request: Request) {
  const session = await getSession(request);
  const userName = session.get(USER_SESSION_KEY) as string | undefined;
  return userName;
}

export async function requireUserName(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userName = await getUserName(request);
  if (!userName) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/?${searchParams}`);
  }
  return userName;
}

export async function createUserSession({
  request,
  userName,
  remember,
  redirectTo,
}: {
  request: Request;
  userName: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userName);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 365 // 365 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
