import "server-only";
import { db } from "@/prisma/db";
import type {
  Activity,
  ActivitySummary,
  ActivityType,
  Answers,
  Question,
  ActivityResult,
} from "./types";
import type { GradingQuestion } from "./grading";

type PracticeCategory = { id: "practice"; title: string; description: string };
type SnapshotQuestion = GradingQuestion & { position: number };
type AttemptRow = {
  id: string;
  activityId: string;
  userId: string;
  status: string;
  answers: unknown;
  result: unknown;
  questionsSnapshot: unknown;
};

export async function getActivityCategories(): Promise<PracticeCategory[]> {
  const row = await db.orm.public.ActivityCategory.where({ id: "practice" }).first();
  return row ? [{ id: "practice", title: row.title, description: row.description }] : [];
}

export async function getActivityCategory(id: string): Promise<PracticeCategory | null> {
  if (id !== "practice") return null;
  const rows = await getActivityCategories();
  return rows[0] ?? null;
}

async function listActivities(): Promise<ActivitySummary[]> {
  const rows = await db.orm.public.Activity.where({ type: "practice", published: true })
    .select("id", "title", "description", "type")
    .include("questions", (questions) => questions.select("id"))
    .orderBy((activity) => activity.title.asc())
    .all();
  return rows.map(({ questions, ...activity }) => ({
    ...activity,
    type: "practice",
    questionCount: questions.length,
  }));
}

export async function getActivities(): Promise<ActivitySummary[]> {
  return listActivities();
}

export async function getActivitiesByType(type: ActivityType): Promise<ActivitySummary[]> {
  return type === "practice" ? listActivities() : [];
}

export async function getActivity(id: string): Promise<Activity | null> {
  const activity = await db.orm.public.Activity.where({ id, type: "practice", published: true })
    .select("id", "title", "description", "type")
    .include("questions", (questions) =>
      questions.select("id", "question").orderBy((question) => question.position.asc()),
    )
    .first();
  return activity ? { ...activity, type: "practice" } : null;
}

export async function getGradingQuestions(activityId: string): Promise<SnapshotQuestion[]> {
  return db.orm.public.ActivityQuestion.where({ activityId })
    .select("id", "question", "correctAnswer", "position")
    .orderBy((question) => question.position.asc())
    .all();
}

export async function createAttempt(userId: string, activityId: string) {
  const [activity, questions] = await Promise.all([
    getActivity(activityId),
    getGradingQuestions(activityId),
  ]);
  if (!activity || !questions.length) return null;
  return db.orm.public.ActivityAttempt.create({
    activityId,
    userId,
    status: "in_progress",
    questionsSnapshot: questions,
    answers: {},
    result: null,
  });
}

export async function getAttempt(attemptId: string, userId: string): Promise<AttemptRow | null> {
  return db.orm.public.ActivityAttempt.where({
    id: attemptId,
    userId,
  }).first() as Promise<AttemptRow | null>;
}

export async function getOpenAttempt(activityId: string, userId: string) {
  return db.orm.public.ActivityAttempt.where({ activityId, userId, status: "in_progress" })
    .orderBy((attempt) => attempt.savedAt.desc())
    .first() as Promise<AttemptRow | null>;
}

export async function getRecentResults(userId: string, limit = 5) {
  const rows = await db.orm.public.ActivityAttempt.where({ userId, status: "submitted" })
    .select("id", "activityId", "result", "submittedAt")
    .include("activity", (activity) => activity.select("title"))
    .orderBy((attempt) => attempt.submittedAt.desc())
    .limit(limit)
    .all();
  return rows.map(({ activity, ...attempt }) => ({
    ...attempt,
    activityTitle: activity?.title ?? "Unavailable practice",
  }));
}

export function parseAttemptAnswers(value: unknown): Answers {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const entries = Object.entries(value);
  if (entries.some(([, answer]) => typeof answer !== "boolean")) return {};
  return Object.fromEntries(entries) as Answers;
}

export function parseAttemptQuestions(value: unknown): SnapshotQuestion[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (question): question is SnapshotQuestion =>
      !!question &&
      typeof question === "object" &&
      typeof question.id === "string" &&
      typeof question.question === "string" &&
      typeof question.correctAnswer === "boolean" &&
      Number.isInteger(question.position),
  );
}

export function parseAttemptResult(value: unknown): ActivityResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const result = value as ActivityResult;
  return typeof result.activityId === "string" && Array.isArray(result.questions) ? result : null;
}

export function clientQuestions(questions: SnapshotQuestion[]): Question[] {
  return questions.map(({ id, question }) => ({ id, question }));
}

export async function getLatestOpenAttempt(userId: string) {
  const row = await db.orm.public.ActivityAttempt.where({ userId, status: "in_progress" })
    .where((attempt) => attempt.activity.some((activity) => activity.published.eq(true)))
    .select("id", "activityId", "savedAt")
    .include("activity", (activity) => activity.select("title"))
    .orderBy((attempt) => attempt.savedAt.desc())
    .first();
  return row?.activity
    ? { id: row.id, activityId: row.activityId, title: row.activity.title, savedAt: row.savedAt }
    : null;
}
