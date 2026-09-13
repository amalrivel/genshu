import { Router } from "express";
import { db } from "../../prisma/db.ts";
import { requireAdmin, requireAuth } from "../../middleware/auth.middleware.ts";
import { email, name, object, positiveId } from "../../shared/validation.ts";
import { safeUser } from "../auth/session.ts";
import { createInvitation, createPasswordReset } from "../auth/tokens.ts";

export const usersRoutes = Router();

usersRoutes.get("/admin/users", requireAuth, requireAdmin, async (_req, res) => {
  res.json(
    (
      await db.orm.public.User.orderBy([
        (user) => user.email.asc(),
        (user) => user.id.asc(),
      ]).all()
    ).map(safeUser),
  );
});

usersRoutes.post("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  const data = object(req.body);
  const user = await db.orm.public.User.create({
    email: email(data.email),
    name: name(data.name),
    role: "Participant",
    isActive: false,
  });
  res.status(201).json(safeUser(user));
});

usersRoutes.post("/admin/users/:id/invitations", requireAuth, requireAdmin, async (req, res) => {
  const userId = positiveId(req.params.id);
  const user = await db.orm.public.User.where({ id: userId }).first();
  if (!user || user.role !== "Participant") {
    res.status(404).json({ error: "Participant not found." });
    return;
  }
  res.json(await createInvitation(req, user));
});

usersRoutes.post("/admin/users/:id/password-resets", requireAuth, requireAdmin, async (req, res) => {
  const userId = positiveId(req.params.id);
  const user = await db.orm.public.User.where({ id: userId }).first();
  if (!user || user.role !== "Participant") {
    res.status(404).json({ error: "Participant not found." });
    return;
  }
  res.json(await createPasswordReset(req, user));
});
