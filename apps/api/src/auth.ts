import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { db } from "./prisma/db.ts";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;
const SESSION_DAYS = 14;
const INVITATION_HOURS = 72;
const RESET_HOURS = 1;
export const auth = Router();
type SafeUser = {
  id: number;
  email: string;
  name: string | null;
  role: "Participant" | "Admin";
  isActive: boolean;
};
declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      sessionId?: number;
    }
  }
}

function fail(status: number, message: string): never {
  throw Object.assign(new Error(message), { status });
}
function object(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    fail(400, "A JSON object is required.");
  return body as Record<string, unknown>;
}
function email(value: unknown) {
  if (typeof value !== "string")
    fail(400, "A valid email address is required.");
  const normalized = value.trim().toLowerCase();
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ||
    normalized.includes("\0")
  )
    fail(400, "A valid email address is required.");
  return normalized;
}
function name(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !value.trim() || value.includes("\0"))
    fail(400, "Name must be text without null characters.");
  return value.trim();
}
function password(value: unknown) {
  if (
    typeof value !== "string" ||
    value.length < 12 ||
    value.length > 1024 ||
    value.includes("\0")
  )
    fail(
      400,
      "Password must be 12 to 1024 characters without null characters.",
    );
  return value;
}
function token() {
  return randomBytes(32).toString("base64url");
}
function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
function expiresIn(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}
function now() {
  return new Date().toISOString();
}

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
async function matchesPassword(value: string, stored: string) {
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
function readCookie(req: Request) {
  return req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("genshu_session="))
    ?.slice("genshu_session=".length);
}
function writeCookie(res: Response, value: string, maxAge: number) {
  res.setHeader(
    "Set-Cookie",
    `genshu_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}
function clearCookie(res: Response) {
  writeCookie(res, "", 0);
}
function safeUser(user: {
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
async function issueSession(res: Response, userId: number) {
  const rawToken = token();
  await db.orm.public.Session.create({
    userId,
    tokenHash: tokenHash(rawToken),
    expiresAt: expiresIn(SESSION_DAYS * 24),
  });
  writeCookie(res, rawToken, SESSION_DAYS * 24 * 60 * 60);
}
async function userFromRequest(req: Request) {
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
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const user = await userFromRequest(req);
    if (!user) fail(401, "Authentication is required.");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    next(
      Object.assign(new Error("Authentication is required."), { status: 401 }),
    );
    return;
  }
  if (req.user.role !== "Admin") {
    next(
      Object.assign(new Error("Administrator access is required."), {
        status: 403,
      }),
    );
    return;
  }
  next();
}
async function validToken(
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
async function revokeUnused(
  model: "Invitation" | "PasswordReset",
  userId: number,
) {
  for (const record of await db.orm.public[model].where({ userId }).all())
    if (!record.consumedAt && !record.revokedAt)
      await db.orm.public[model]
        .where({ id: record.id })
        .update({ revokedAt: now() });
}
function publicTokenResponse(valid: Awaited<ReturnType<typeof validToken>>) {
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

auth.post("/auth/login", async (req, res) => {
  const data = object(req.body);
  const user = await db.orm.public.User.where({
    email: email(data.email),
  }).first();
  if (
    !user ||
    !user.isActive ||
    !user.passwordHash ||
    !(await matchesPassword(
      typeof data.password === "string" ? data.password : "",
      user.passwordHash,
    ))
  )
    fail(401, "Invalid email or password.");
  await issueSession(res, user.id);
  res.json({ user: safeUser(user) });
});
auth.post("/auth/logout", requireAuth, async (req, res) => {
  if (req.sessionId)
    await db.orm.public.Session.where({ id: req.sessionId }).update({
      revokedAt: now(),
    });
  clearCookie(res);
  res.status(204).end();
});
auth.get("/auth/session", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
auth.get("/auth/invitations/:token", async (req, res) => {
  res.json(
    publicTokenResponse(await validToken("Invitation", req.params.token)),
  );
});
auth.post("/auth/invitations/:token", async (req, res) => {
  const valid = await validToken("Invitation", req.params.token);
  if (!valid) fail(400, "This invitation is invalid or expired.");
  const passwordHash = await hashPassword(password(object(req.body).password));
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
  res.status(204).end();
});
auth.get("/auth/password-resets/:token", async (req, res) => {
  res.json(
    publicTokenResponse(await validToken("PasswordReset", req.params.token)),
  );
});
auth.post("/auth/password-resets/:token", async (req, res) => {
  const valid = await validToken("PasswordReset", req.params.token);
  if (!valid) fail(400, "This password reset link is invalid or expired.");
  const passwordHash = await hashPassword(password(object(req.body).password));
  const consumed = await db.transaction(async (tx) => {
    const reset = await tx.orm.public.PasswordReset.where({
      id: valid.record.id,
      consumedAt: null,
      revokedAt: null,
    })
      .where((record) => record.expiresAt.gt(now()))
      .update({ consumedAt: now() });
    if (!reset) return false;
    await tx.orm.public.User.where({ id: valid.user.id }).update({
      passwordHash,
    });
    for (const session of await tx.orm.public.Session.where({
      userId: valid.user.id,
    }).all())
      if (!session.revokedAt)
        await tx.orm.public.Session.where({ id: session.id }).update({
          revokedAt: now(),
        });
    return true;
  });
  if (!consumed) fail(400, "This password reset link is no longer valid.");
  res.status(204).end();
});
auth.get("/admin/users", requireAuth, requireAdmin, async (_req, res) => {
  res.json(
    (
      await db.orm.public.User.orderBy([
        (user) => user.email.asc(),
        (user) => user.id.asc(),
      ]).all()
    ).map(safeUser),
  );
});
auth.post("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  const data = object(req.body);
  const user = await db.orm.public.User.create({
    email: email(data.email),
    name: name(data.name),
    role: "Participant",
    isActive: false,
  });
  res.status(201).json(safeUser(user));
});
auth.post(
  "/admin/users/:id/invitations",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId < 1)
      fail(400, "User ID must be a positive integer.");
    const user = await db.orm.public.User.where({ id: userId }).first();
    if (!user || user.role !== "Participant")
      fail(404, "Participant not found.");
    await revokeUnused("Invitation", userId);
    const rawToken = token();
    const invitation = await db.orm.public.Invitation.create({
      userId,
      tokenHash: tokenHash(rawToken),
      expiresAt: expiresIn(INVITATION_HOURS),
    });
    const url = `${webUrl(req)}/invite/${rawToken}`;
    res.json({
      url,
      expiresAt: invitation.expiresAt,
      message: `Hello${user.name ? ` ${user.name}` : ""},\n\nSet your Genshu password here: ${url}\n\nThis link expires at ${invitation.expiresAt}.`,
    });
  },
);
auth.post(
  "/admin/users/:id/password-resets",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId < 1)
      fail(400, "User ID must be a positive integer.");
    const user = await db.orm.public.User.where({ id: userId }).first();
    if (!user || user.role !== "Participant")
      fail(404, "Participant not found.");
    await revokeUnused("PasswordReset", userId);
    const rawToken = token();
    const reset = await db.orm.public.PasswordReset.create({
      userId,
      tokenHash: tokenHash(rawToken),
      expiresAt: expiresIn(RESET_HOURS),
    });
    const url = `${webUrl(req)}/reset-password/${rawToken}`;
    res.json({
      url,
      expiresAt: reset.expiresAt,
      message: `Hello${user.name ? ` ${user.name}` : ""},\n\nReset your Genshu password here: ${url}\n\nThis link expires at ${reset.expiresAt}.`,
    });
  },
);
