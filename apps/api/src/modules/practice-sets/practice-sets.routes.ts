import { Router } from "express";
import { db } from "../../prisma/db.ts";
import { positiveId } from "../../shared/validation.ts";
import {
  practiceSetDetail,
  practiceSetFields,
  questionIds,
  replaceQuestions,
  validateQuestionIds,
} from "./practice-sets.service.ts";

export const practiceSetsRoutes = Router();

practiceSetsRoutes.get("/practice-sets", async (_req, res) => {
  res.json(
    await db.orm.public.PracticeSet.orderBy([
      (set) => set.title.asc(),
      (set) => set.id.asc(),
    ]).all(),
  );
});

practiceSetsRoutes.get("/practice-sets/:id", async (req, res) => {
  const set = await db.orm.public.PracticeSet.where({ id: positiveId(req.params.id) }).first();
  if (!set) {
    res.status(404).json({ error: "Practice set not found." });
    return;
  }
  res.json(await practiceSetDetail(set));
});

practiceSetsRoutes.post("/practice-sets", async (req, res) => {
  const data = practiceSetFields(req.body);
  const selected = data.questionIds ?? [];
  await validateQuestionIds(selected);
  const set = await db.transaction(async (tx) => {
    const practiceSet = await tx.orm.public.PracticeSet.create({
      title: data.title,
      description: data.description,
    });
    for (const [position, questionId] of selected.entries())
      await tx.orm.public.PracticeSetQuestion.create({ practiceSetId: practiceSet.id, questionId, position });
    return practiceSet;
  });
  res.location(`/practice-sets/${set.id}`).status(201).json(await practiceSetDetail(set));
});

practiceSetsRoutes.put("/practice-sets/:id", async (req, res) => {
  const practiceSetId = positiveId(req.params.id);
  const data = practiceSetFields(req.body);
  if (data.questionIds) await validateQuestionIds(data.questionIds);
  const set = await db.transaction(async (tx) => {
    const practiceSet = await tx.orm.public.PracticeSet.where({ id: practiceSetId }).update({
      title: data.title,
      description: data.description,
    });
    if (!practiceSet || !data.questionIds) return practiceSet;
    await tx.execute(
      tx.sql.public.practiceSetQuestion
        .delete()
        .where((link, fns) => fns.eq(link.practiceSetId, practiceSetId))
        .build(),
    );
    for (const [position, questionId] of data.questionIds.entries())
      await tx.orm.public.PracticeSetQuestion.create({ practiceSetId, questionId, position });
    return practiceSet;
  });
  if (!set) {
    res.status(404).json({ error: "Practice set not found." });
    return;
  }
  res.json(await practiceSetDetail(set));
});

practiceSetsRoutes.put("/practice-sets/:id/questions", async (req, res) => {
  const practiceSetId = positiveId(req.params.id);
  const selected = questionIds((req.body as Record<string, unknown>)?.questionIds, true)!;
  await validateQuestionIds(selected);
  const set = await replaceQuestions(practiceSetId, selected);
  if (!set) {
    res.status(404).json({ error: "Practice set not found." });
    return;
  }
  res.json(await practiceSetDetail(set));
});

practiceSetsRoutes.delete("/practice-sets/:id", async (req, res) => {
  const set = await db.orm.public.PracticeSet.where({ id: positiveId(req.params.id) }).delete();
  if (!set) {
    res.status(404).json({ error: "Practice set not found." });
    return;
  }
  res.status(204).end();
});
