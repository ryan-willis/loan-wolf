import { createCookieSessionStorage } from "@remix-run/node";
import { logger } from "./logging.server";
import { join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { randomBytes } from "crypto";

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

export function getSessionSecret() {
  let { SESSION_SECRET = "" } = process.env;

  if (!SESSION_SECRET) {
    logger.warn("variable SESSION_SECRET does not exist in the environment");
    const { DATABASE_URL } = process.env;
    let sessionSecretFile = "/data/loan-wolf/session-secret.txt";
    if (DATABASE_URL === "file:./dev.db") {
      // dev mode, locally
      sessionSecretFile = join(tmpdir(), "loan-wolf-session-secret.txt");
    }
    if (!existsSync(sessionSecretFile)) {
      logger.warn({ sessionSecretFile }, "generating a new session secret");
      SESSION_SECRET = randomBytes(32).toString("hex");
      writeFileSync(sessionSecretFile, SESSION_SECRET);
    } else {
      logger.warn({ sessionSecretFile }, "using existing session secret");
      SESSION_SECRET = readFileSync(sessionSecretFile, "utf-8");
    }
  }

  return SESSION_SECRET;
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__loanwolf",
      path: "/",
      sameSite: "lax",
      secrets: [getSessionSecret()],
      // secure: true,
    },
  });

export { getSession, commitSession, destroySession };
