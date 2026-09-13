import { db } from "../../prisma/db.ts";
import { fail } from "../../shared/errors.ts";
import { object, password } from "../../shared/validation.ts";
import { matchesPassword, hashPassword } from "./password.ts";
import { now, validToken } from "./tokens.ts";

export { hashPassword } from "./password.ts";
export { issueSession, revokeSession, safeUser, userFromRequest } from "./session.ts";
export { publicTokenResponse, validToken } from "./tokens.ts";

export async function login(email: string, rawPassword: unknown) {
  const user = await db.orm.public.User.where({ email }).first();
  if (
    !user ||
    !user.isActive ||
    !user.passwordHash ||
    !(await matchesPassword(
      typeof rawPassword === "string" ? rawPassword : "",
      user.passwordHash,
    ))
  ) {
    fail(401, "Invalid email or password.");
  }
  return user;
}

export async function setInvitationPassword(token: string, body: unknown) {
  const valid = await validToken("Invitation", token);
  if (!valid) fail(400, "This invitation is invalid or expired.");
  const passwordHash = await hashPassword(password(object(body).password));
  const consumed = await db.transaction(async (tx) => {
    const invitation = await tx.orm.public.Invitation.where({
      id: valid.record.id,
      consumedAt: null,
      revokedAt: null,
    })
      .where((record) => record.expiresAt.gt(now()))
      .update({ consumedAt: now() });
    if (!invitation) return false;
    await tx.orm.public.User.where({ id: valid.user.id }).update({
      passwordHash,
      isActive: true,
    });
    return true;
  });
  if (!consumed) fail(400, "This invitation is no longer valid.");
}

export async function setResetPassword(token: string, body: unknown) {
  const valid = await validToken("PasswordReset", token);
  if (!valid) fail(400, "This password reset link is invalid or expired.");
  const passwordHash = await hashPassword(password(object(body).password));
  const consumed = await db.transaction(async (tx) => {
    const reset = await tx.orm.public.PasswordReset.where({
      id: valid.record.id,
      consumedAt: null,
      revokedAt: null,
    })
      .where((record) => record.expiresAt.gt(now()))
      .update({ consumedAt: now() });
    if (!reset) return false;
    await tx.orm.public.User.where({ id: valid.user.id }).update({ passwordHash });
    for (const session of await tx.orm.public.Session.where({ userId: valid.user.id }).all())
      if (!session.revokedAt)
        await tx.orm.public.Session.where({ id: session.id }).update({ revokedAt: now() });
    return true;
  });
  if (!consumed) fail(400, "This password reset link is no longer valid.");
}
