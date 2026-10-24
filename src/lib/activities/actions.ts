"use server";

import { db } from "@/prisma/db";
import { requireUser } from "@/lib/auth-session";
import { gradeActivity } from "./grading";
import { createAttempt, getAttempt, parseAttemptQuestions, parseAttemptResult } from "./queries";
import type { Answers } from "./types";

function validateAnswers(answers: unknown, questionIds: Set<string>): asserts answers is Answers {
  if (!answers || typeof answers !== "object" || Array.isArray(answers))
    throw new Error("Invalid answers");
  const entries = Object.entries(answers);
  if (entries.some(([id, value]) => !questionIds.has(id) || typeof value !== "boolean")) {
    throw new Error("Answers do not match this attempt");
  }
}

export async function startPractice(activityId: string) {
  const session = await requireUser();
  if (typeof activityId !== "string" || !activityId) throw new Error("Invalid activity");
  const attempt = await createAttempt(session.user.id, activityId);
  if (!attempt) throw new Error("Practice is unavailable");
  return { attemptId: attempt.id };
}

export async function saveAttempt(attemptId: string, answers: Answers) {
  const session = await requireUser();
  if (typeof attemptId !== "string" || !attemptId) throw new Error("Invalid attempt");
  const attempt = await getAttempt(attemptId, session.user.id);
  if (!attempt || attempt.status !== "in_progress") throw new Error("Draft is unavailable");
  const questions = parseAttemptQuestions(attempt.questionsSnapshot);
  validateAnswers(answers, new Set(questions.map((question) => question.id)));
  const updated = await db.orm.public.ActivityAttempt.where({
    id: attemptId,
    userId: session.user.id,
    status: "in_progress",
  }).update({ answers, savedAt: new Date().toISOString() });
  if (!updated) throw new Error("Draft could not be saved");
  return { savedAt: updated.savedAt };
}

export async function submitAttempt(attemptId: string, answers: Answers) {
  const session = await requireUser();
  if (typeof attemptId !== "string" || !attemptId) throw new Error("Invalid attempt");
  return db.transaction(async (tx) => {
    const attempt = await tx.orm.public.ActivityAttempt.where({
      id: attemptId,
      userId: session.user.id,
    }).first();
    if (!attempt) throw new Error("Attempt not found");
    if (attempt.status === "submitted") {
      const saved = parseAttemptResult(attempt.result);
      if (saved) return saved;
      throw new Error("Saved result is unavailable");
    }
    if (attempt.status !== "in_progress") throw new Error("Attempt is not open");
    const questions = parseAttemptQuestions(attempt.questionsSnapshot);
    if (!questions.length) throw new Error("Attempt has no questions");
    validateAnswers(answers, new Set(questions.map((question) => question.id)));
    const result = gradeActivity(attempt.activityId, questions, answers);
    const now = new Date().toISOString();
    const saved = await tx.orm.public.ActivityAttempt.where({
      id: attemptId,
      userId: session.user.id,
      status: "in_progress",
    }).update({ answers, result, status: "submitted", submittedAt: now, savedAt: now });
    if (saved) return result;
    const raced = await tx.orm.public.ActivityAttempt.where({
      id: attemptId,
      userId: session.user.id,
    }).first();
    const existing = raced?.status === "submitted" ? parseAttemptResult(raced.result) : null;
    if (existing) return existing;
    throw new Error("Attempt could not be submitted");
  });
}
