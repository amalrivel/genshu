import { Router } from "express";
import { db } from "../../prisma/db.ts";
import { fail } from "../../shared/errors.ts";
import { object, optionalText, positiveId, requiredText } from "../../shared/validation.ts";

export const questionsRoutes = Router();

function questionFields(body: unknown, topicRequired: boolean) {
  const data = object(body);
  if (typeof data.correctAnswer !== "boolean")
    fail(400, "Correct answer must be a boolean.");
  return {
    japaneseText: requiredText(data.japaneseText, "Japanese text"),
    indonesianTranslation: requiredText(data.indonesianTranslation, "Indonesian translation"),
    furigana: optionalText(data.furigana, "Furigana"),
    correctAnswer: data.correctAnswer,
    japaneseExplanation: requiredText(data.japaneseExplanation, "Japanese explanation"),
    indonesianExplanation: requiredText(data.indonesianExplanation, "Indonesian explanation"),
    topicId:
      topicRequired || data.topicId !== undefined
        ? positiveId(data.topicId)
        : undefined,
  };
}

questionsRoutes.get("/questions", async (req, res) => {
  const questions =
    req.query.topicId === undefined
      ? db.orm.public.Question
      : db.orm.public.Question.where({ topicId: positiveId(req.query.topicId) });
  res.json(
    await questions.orderBy([(question) => question.japaneseText.asc(), (question) => question.id.asc()]).all(),
  );
});

questionsRoutes.get("/questions/:id", async (req, res) => {
  const question = await db.orm.public.Question.where({ id: positiveId(req.params.id) }).first();
  if (!question) {
    res.status(404).json({ error: "Question not found." });
    return;
  }
  res.json(question);
});

questionsRoutes.post("/questions", async (req, res) => {
  const data = questionFields(req.body, true);
  const question = await db.orm.public.Question.create({
    japaneseText: data.japaneseText,
    indonesianTranslation: data.indonesianTranslation,
    furigana: data.furigana,
    correctAnswer: data.correctAnswer,
    japaneseExplanation: data.japaneseExplanation,
    indonesianExplanation: data.indonesianExplanation,
    topicId: data.topicId!,
  });
  res.location(`/questions/${question.id}`).status(201).json(question);
});

questionsRoutes.put("/questions/:id", async (req, res) => {
  const data = questionFields(req.body, false);
  const question = await db.orm.public.Question.where({ id: positiveId(req.params.id) }).update({
    japaneseText: data.japaneseText,
    indonesianTranslation: data.indonesianTranslation,
    furigana: data.furigana,
    correctAnswer: data.correctAnswer,
    japaneseExplanation: data.japaneseExplanation,
    indonesianExplanation: data.indonesianExplanation,
    ...(data.topicId === undefined ? {} : { topicId: data.topicId }),
  });
  if (!question) {
    res.status(404).json({ error: "Question not found." });
    return;
  }
  res.json(question);
});

questionsRoutes.delete("/questions/:id", async (req, res) => {
  const question = await db.orm.public.Question.where({ id: positiveId(req.params.id) }).delete();
  if (!question) {
    res.status(404).json({ error: "Question not found." });
    return;
  }
  res.status(204).end();
});
