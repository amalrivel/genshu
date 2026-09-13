import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

export async function hashPassword(value: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = (await scrypt(value, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  })) as Buffer;
  return `scrypt$16384$8$1$${salt}$${hash.toString("base64url")}`;
}

export async function matchesPassword(value: string, stored: string) {
  const [algorithm, N, r, p, salt, expected] = stored.split("$");
  if (algorithm !== "scrypt" || !N || !r || !p || !salt || !expected)
    return false;
  const hash = (await scrypt(value, salt, 64, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  })) as Buffer;
  const expectedHash = Buffer.from(expected, "base64url");
  return (
    expectedHash.length === hash.length && timingSafeEqual(expectedHash, hash)
  );
}
