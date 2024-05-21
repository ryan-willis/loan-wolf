import { createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  loans: string[];
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__loanwolf",
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secrets: ["changethis"],
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };
