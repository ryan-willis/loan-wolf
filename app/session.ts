import { createCookieSessionStorage } from "@remix-run/node";

// Do NOT put sensitive information in the session.
// The session is stored in a cookie, and the user can see it
// by base64-decoding the contents.
// Remix _signs_ the session data, so it will be thrown out if
// it's tampered with, but it's not encrypted client-side.
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
      path: "/",
      sameSite: "lax",
      secrets: ["changethis"],
      // secure: true,
    },
  });

export { getSession, commitSession, destroySession };
