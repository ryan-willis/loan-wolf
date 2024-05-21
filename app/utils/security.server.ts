import { hash, verify } from "argon2";

export async function hashPassword(password: string) {
  return hash(password, {
    secret: Buffer.from("changethis"),
  });
}

export async function verifyPassword(hash: string, password: string) {
  return verify(hash, password, {
    secret: Buffer.from("changethis"),
  });
}
