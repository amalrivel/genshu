import { createHash, randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { db } from "../../prisma/db.ts";
import type { SafeUser } from "./auth.types.ts";

const SESSION_DAYS = 14;

function token() {
  return randomBytes(32).toString("base64url");
}

function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function expiresIn(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function now() {
  return new Date().toISOString();
}

function readCookie(req: Request) {
  return req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("genshu_session="))
    ?.slice("genshu_session=".length);
}

export function writeSessionCookie(res: Response, value: string, maxAge: number) {
  res.setHeader(
    "Set-Cookie",
    `genshu_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}

export function clearSessionCookie(res: Response) {
  writeSessionCookie(res, "", 0);
}

export function safeUser(user: {
  id: number;
  email: string;
  name: string | null;
  role: "Participant" | "Admin";
  isActive: boolean;
}): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  };
}

export async function issueSession(res: Response, userId: number) {
  const rawToken = token();
  await db.orm.public.Session.create({
    userId,
    tokenHash: tokenHash(rawToken),
    expiresAt: expiresIn(SESSION_DAYS),
  });
  writeSessionCookie(res, rawToken, SESSION_DAYS * 24 * 60 * 60);
}

export async function userFromRequest(req: Request) {
  const rawToken = readCookie(req);
  if (!rawToken) return null;
  const session = await db.orm.public.Session.where({
    tokenHash: tokenHash(rawToken),
  }).first();
  if (
    !session ||
    session.revokedAt ||
    new Date(session.expiresAt).getTime() <= Date.now()
  )
    return null;
  const user = await db.orm.public.User.where({ id: session.userId }).first();
  if (!user || !user.isActive) return null;
  req.sessionId = session.id;
  return safeUser(user);
}

export async function revokeSession(sessionId: number) {
  await db.orm.public.Session.where({ id: sessionId }).update({
    revokedAt: now(),
  });
}

export async function revokeUserSessions(userId: number) {
  for (const session of await db.orm.public.Session.where({ userId }).all())
    if (!session.revokedAt)
      await db.orm.public.Session.where({ id: session.id }).update({
        revokedAt: now(),
      });
}
