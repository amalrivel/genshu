import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { object, email } from "../../shared/validation.ts";
import {
  clearSessionCookie,
  issueSession,
  revokeSession,
  safeUser,
} from "./session.ts";
import {
  login,
  publicTokenResponse,
  setInvitationPassword,
  setResetPassword,
  validToken,
} from "./auth.service.ts";

export const authRoutes = Router();

authRoutes.post("/auth/login", async (req, res) => {
  const data = object(req.body);
  const user = await login(email(data.email), data.password);
  await issueSession(res, user.id);
  res.json({ user: safeUser(user) });
});

authRoutes.post("/auth/logout", requireAuth, async (req, res) => {
  if (req.sessionId) await revokeSession(req.sessionId);
  clearSessionCookie(res);
  res.status(204).end();
});

authRoutes.get("/auth/session", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

authRoutes.get("/auth/invitations/:token", async (req, res) => {
  res.json(publicTokenResponse(await validToken("Invitation", req.params.token)));
});

authRoutes.post("/auth/invitations/:token", async (req, res) => {
  await setInvitationPassword(req.params.token, req.body);
  res.status(204).end();
});

authRoutes.get("/auth/password-resets/:token", async (req, res) => {
  res.json(publicTokenResponse(await validToken("PasswordReset", req.params.token)));
});

authRoutes.post("/auth/password-resets/:token", async (req, res) => {
  await setResetPassword(req.params.token, req.body);
  res.status(204).end();
});
