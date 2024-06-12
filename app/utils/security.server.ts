import { hash, verify } from "argon2";
import { logger } from "./logging.server";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { randomBytes } from "crypto";
import { join } from "path";
import { tmpdir } from "os";

export function getPasswordSecret() {
  let { PASSWORD_SECRET = "" } = process.env;

  if (!PASSWORD_SECRET) {
    logger.warn("variable PASSWORD_SECRET does not exist in the environment");
    const { DATABASE_URL } = process.env;
    let passwordSecretFile = "/data/loan-wolf/password-secret.txt";
    if (DATABASE_URL === "file:./dev.db") {
      // dev mode, locally
      passwordSecretFile = join(tmpdir(), "loan-wolf-password-secret.txt");
    }
    if (!existsSync(passwordSecretFile)) {
      logger.warn({ passwordSecretFile }, "generating a new password secret");
      PASSWORD_SECRET = randomBytes(32).toString("hex");
      writeFileSync(passwordSecretFile, PASSWORD_SECRET);
    } else {
      logger.warn({ passwordSecretFile }, "using existing password secret");
      PASSWORD_SECRET = readFileSync(passwordSecretFile, "utf-8");
    }
  }

  return PASSWORD_SECRET;
}

const secret = Buffer.from(getPasswordSecret());

export async function hashPassword(password: string) {
  return hash(password, { secret });
}

export async function verifyPassword(hash: string, password: string) {
  return verify(hash, password, { secret });
}
