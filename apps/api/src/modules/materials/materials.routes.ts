import { Router } from "express";
import { db } from "../../prisma/db.ts";
import { nonEmptyText, object, positiveId, requiredText } from "../../shared/validation.ts";

export const materialsRoutes = Router();

function materialFields(body: unknown) {
  const data = object(body);
  return {
    title: requiredText(data.title, "Title"),
    content: nonEmptyText(data.content, "Content"),
    topicId: data.topicId,
  };
}

materialsRoutes.get("/materials", async (req, res) => {
  const materials =
    req.query.topicId === undefined
      ? db.orm.public.Material
      : db.orm.public.Material.where({ topicId: positiveId(req.query.topicId) });
  res.json(
    await materials.orderBy([(material) => material.title.asc(), (material) => material.id.asc()]).all(),
  );
});

materialsRoutes.get("/materials/:id", async (req, res) => {
  const material = await db.orm.public.Material.where({ id: positiveId(req.params.id) }).first();
  if (!material) {
    res.status(404).json({ error: "Material not found." });
    return;
  }
  res.json(material);
});

materialsRoutes.post("/materials", async (req, res) => {
  const data = materialFields(req.body);
  const material = await db.orm.public.Material.create({
    title: data.title,
    content: data.content,
    topicId: positiveId(data.topicId),
  });
  res.location(`/materials/${material.id}`).status(201).json(material);
});

materialsRoutes.put("/materials/:id", async (req, res) => {
  const data = materialFields(req.body);
  const material = await db.orm.public.Material.where({ id: positiveId(req.params.id) }).update({
    title: data.title,
    content: data.content,
    ...(data.topicId === undefined ? {} : { topicId: positiveId(data.topicId) }),
  });
  if (!material) {
    res.status(404).json({ error: "Material not found." });
    return;
  }
  res.json(material);
});

materialsRoutes.delete("/materials/:id", async (req, res) => {
  const material = await db.orm.public.Material.where({ id: positiveId(req.params.id) }).delete();
  if (!material) {
    res.status(404).json({ error: "Material not found." });
    return;
  }
  res.status(204).end();
});
