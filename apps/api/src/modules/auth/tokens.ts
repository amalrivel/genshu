import { createHash, randomBytes } from "node:crypto";
import type { Request } from "express";
import { db } from "../../prisma/db.ts";

const INVITATION_HOURS = 72;
const RESET_HOURS = 1;

export function token() {
  return randomBytes(32).toString("base64url");
}

export function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function now() {
  return new Date().toISOString();
}

function expiresIn(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export async function validToken(
  model: "Invitation" | "PasswordReset",
  rawToken: string,
) {
  const record = await db.orm.public[model]
    .where({ tokenHash: tokenHash(rawToken) })
    .first();
  if (
    !record ||
    record.consumedAt ||
    record.revokedAt ||
    new Date(record.expiresAt).getTime() <= Date.now()
  )
    return null;
  const user = await db.orm.public.User.where({ id: record.userId }).first();
  return user ? { record, user } : null;
}

export async function revokeUnused(
  model: "Invitation" | "PasswordReset",
  userId: number,
) {
  for (const record of await db.orm.public[model].where({ userId }).all())
    if (!record.consumedAt && !record.revokedAt)
      await db.orm.public[model]
        .where({ id: record.id })
        .update({ revokedAt: now() });
}

export function publicTokenResponse(
  valid: Awaited<ReturnType<typeof validToken>>,
) {
  return valid
    ? {
        valid: true,
        email: valid.user.email,
        name: valid.user.name,
        expiresAt: valid.record.expiresAt,
      }
    : { valid: false };
}

function webUrl(req: Request) {
  return process.env.WEB_URL || req.get("origin") || "http://localhost:5173";
}

export async function createInvitation(req: Request, user: { id: number; name: string | null }) {
  await revokeUnused("Invitation", user.id);
  const rawToken = token();
  const invitation = await db.orm.public.Invitation.create({
    userId: user.id,
    tokenHash: tokenHash(rawToken),
    expiresAt: expiresIn(INVITATION_HOURS),
  });
  const url = `${webUrl(req)}/invite/${rawToken}`;
  return {
    url,
    expiresAt: invitation.expiresAt,
    message: `Hello${user.name ? ` ${user.name}` : ""},\n\nSet your Genshu password here: ${url}\n\nThis link expires at ${invitation.expiresAt}.`,
  };
}

export async function createPasswordReset(req: Request, user: { id: number; name: string | null }) {
  await revokeUnused("PasswordReset", user.id);
  const rawToken = token();
  const reset = await db.orm.public.PasswordReset.create({
    userId: user.id,
    tokenHash: tokenHash(rawToken),
    expiresAt: expiresIn(RESET_HOURS),
  });
  const url = `${webUrl(req)}/reset-password/${rawToken}`;
  return {
    url,
    expiresAt: reset.expiresAt,
    message: `Hello${user.name ? ` ${user.name}` : ""},\n\nReset your Genshu password here: ${url}\n\nThis link expires at ${reset.expiresAt}.`,
  };
}
