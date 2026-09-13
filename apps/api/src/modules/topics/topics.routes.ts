import { Router } from "express";
import { db } from "../../prisma/db.ts";
import { object, positiveId, requiredText } from "../../shared/validation.ts";

export const topicsRoutes = Router();

topicsRoutes.get("/topics", async (_req, res) => {
  res.json(
    await db.orm.public.Topic.orderBy([
      (topic) => topic.title.asc(),
      (topic) => topic.id.asc(),
    ]).all(),
  );
});

topicsRoutes.get("/topics/:id", async (req, res) => {
  const topic = await db.orm.public.Topic.where({ id: positiveId(req.params.id) }).first();
  if (!topic) {
    res.status(404).json({ error: "Topic not found." });
    return;
  }
  res.json(topic);
});

topicsRoutes.post("/topics", async (req, res) => {
  const topic = await db.orm.public.Topic.create({
    title: requiredText(object(req.body).title, "Title"),
  });
  res.location(`/topics/${topic.id}`).status(201).json(topic);
});

topicsRoutes.put("/topics/:id", async (req, res) => {
  const topic = await db.orm.public.Topic.where({ id: positiveId(req.params.id) }).update({
    title: requiredText(object(req.body).title, "Title"),
  });
  if (!topic) {
    res.status(404).json({ error: "Topic not found." });
    return;
  }
  res.json(topic);
});

topicsRoutes.delete("/topics/:id", async (req, res) => {
  const topic = await db.orm.public.Topic.where({ id: positiveId(req.params.id) }).delete();
  if (!topic) {
    res.status(404).json({ error: "Topic not found." });
    return;
  }
  res.status(204).end();
});
