import { hash, verify } from "argon2";

const secret = Buffer.from(process.env["PASSWORD_SECRET"]!);

export async function hashPassword(password: string) {
  return hash(password, { secret });
}

export async function verifyPassword(hash: string, password: string) {
  return verify(hash, password, { secret });
}
