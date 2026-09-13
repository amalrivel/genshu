import { Router } from "express";
import { db } from "../../prisma/db.ts";
import { fail } from "../../shared/errors.ts";
import { object, positiveId } from "../../shared/validation.ts";

export const practiceRoutes = Router();

async function practiceSetForPractice(practiceSet: { id: number }) {
  const links = await db.orm.public.PracticeSetQuestion.where({ practiceSetId: practiceSet.id })
    .orderBy([(link) => link.position.asc(), (link) => link.id.asc()])
    .all();
  const questions = links.length
    ? await db.orm.public.Question.where((question) => question.id.in(links.map((link) => link.questionId))).all()
    : [];
  const byId = new Map(questions.map((question) => [question.id, question]));
  return {
    ...practiceSet,
    questions: links.map((link) => {
      const question = byId.get(link.questionId)!;
      return {
        id: question.id,
        japaneseText: question.japaneseText,
        indonesianTranslation: question.indonesianTranslation,
        furigana: question.furigana,
        position: link.position,
      };
    }),
  };
}

function submittedAnswers(body: unknown) {
  const answers = object(body).answers;
  if (!Array.isArray(answers)) fail(400, "Answers must be an array.");
  const selected = answers.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item))
      fail(400, "Each answer must contain a question ID and boolean answer.");
    const answer = item as Record<string, unknown>;
    if (typeof answer.answer !== "boolean")
      fail(400, "Each answer must contain a question ID and boolean answer.");
    return { questionId: positiveId(answer.questionId), answer: answer.answer };
  });
  if (new Set(selected.map((answer) => answer.questionId)).size !== selected.length)
    fail(400, "Answers must not contain duplicate question IDs.");
  return selected;
}

practiceRoutes.get("/practice", async (_req, res) => {
  res.json(
    await db.orm.public.PracticeSet.orderBy([
      (set) => set.title.asc(),
      (set) => set.id.asc(),
    ]).all(),
  );
});

practiceRoutes.get("/practice-sets/:id/practice", async (req, res) => {
  const set = await db.orm.public.PracticeSet.where({ id: positiveId(req.params.id) }).first();
  if (!set) {
    res.status(404).json({ error: "Practice set not found." });
    return;
  }
  res.json(await practiceSetForPractice(set));
});

practiceRoutes.post("/practice-sets/:id/submit", async (req, res) => {
  const practiceSetId = positiveId(req.params.id);
  const answers = submittedAnswers(req.body);
  const set = await db.orm.public.PracticeSet.where({ id: practiceSetId }).first();
  if (!set) {
    res.status(404).json({ error: "Practice set not found." });
    return;
  }
  const links = await db.orm.public.PracticeSetQuestion.where({ practiceSetId })
    .orderBy([(link) => link.position.asc(), (link) => link.id.asc()])
    .all();
  const questionIds = new Set(links.map((link) => link.questionId));
  if (answers.some((answer) => !questionIds.has(answer.questionId)))
    fail(400, "One or more answers do not belong to this practice set.");
  const questions = links.length
    ? await db.orm.public.Question.where((question) => question.id.in(links.map((link) => link.questionId))).all()
    : [];
  const byId = new Map(questions.map((question) => [question.id, question]));
  const submitted = new Map(answers.map((answer) => [answer.questionId, answer.answer]));
  const results = links.map((link) => {
    const question = byId.get(link.questionId)!;
    const answer = submitted.get(question.id) ?? null;
    return {
      questionId: question.id,
      answer,
      isCorrect: answer === question.correctAnswer,
      correctAnswer: question.correctAnswer,
      japaneseExplanation: question.japaneseExplanation,
      indonesianExplanation: question.indonesianExplanation,
    };
  });
  const correct = results.filter((result) => result.isCorrect).length;
  const unanswered = results.filter((result) => result.answer === null).length;
  res.json({
    total: results.length,
    correct,
    incorrect: results.length - correct,
    unanswered,
    answers: results,
  });
});
