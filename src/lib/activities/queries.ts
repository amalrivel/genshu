// NOTE: Current behavior: legacy Prisma queries import a client/enum no longer present.
// TODO: Reconcile with the Prisma 8 contract/runtime; see docs/developer-guide.md, Data integration.
// NOTE: Query memilih field secara eksplisit untuk menjaga kontrak data UI.
// Modul server-only mencegah impor database ke client, tetapi tidak menyaring
// data respons secara otomatis; select tetap menentukan apa yang diterima browser.
// TODO: Saat akses siswa/admin diterapkan, batasi data berdasarkan pengguna dan
// status publikasi. Jangan menganggap mengetahui ID berarti memiliki izin akses.

import "server-only";
import { prisma } from "@/lib/db";
import { ActivityType as SupportedActivityType } from "@/generated/prisma/enums";
import type { Activity, ActivitySummary, ActivityType } from "./types";
import type { GradingQuestion } from "./grading";

type ActivityCategory = { id: ActivityType; title: string; description: string };

function isActivityType(id: string): id is ActivityType {
  return Object.values(SupportedActivityType).some((type) => type === id);
}

export async function getActivityCategories(): Promise<ActivityCategory[]> {
  const categories = await prisma.activityCategory.findMany({
    select: { id: true, title: true, description: true },
  });
  // NOTE: Database owns labels; the schema enum controls supported behavior
  // and the display order. Unsupported master IDs cannot create usable routes.
  return Object.values(SupportedActivityType).flatMap((id) => {
    const category = categories.find((category) => category.id === id);
    return category ? [{ ...category, id }] : [];
  });
}

export async function getActivityCategory(id: string): Promise<ActivityCategory | null> {
  if (!isActivityType(id)) return null;
  const category = await prisma.activityCategory.findUnique({
    where: { id }, select: { id: true, title: true, description: true },
  });
  return category ? { ...category, id } : null;
}

async function listActivities(type?: ActivityType): Promise<ActivitySummary[]> {
  const rows = await prisma.activity.findMany({
    where: type ? { type } : undefined,
    select: {
      id: true, title: true, description: true, type: true,
      _count: { select: { questions: true } },
    },
    orderBy: { id: "asc" },
  });
  return rows.map(({ _count, ...activity }) => ({
    ...activity, questionCount: _count.questions,
  }));
}

export async function getActivities(): Promise<ActivitySummary[]> {
  return listActivities();
}

export async function getActivitiesByType(type: ActivityType): Promise<ActivitySummary[]> {
  return listActivities(type);
}

export async function getActivity(id: string): Promise<Activity | null> {
  // NOTE: Only these fields reach the runner; answer keys are excluded.
  return prisma.activity.findUnique({
    where: { id },
    select: {
      id: true, title: true, description: true, type: true,
      questions: { select: { id: true, question: true }, orderBy: { position: "asc" } },
    },
  });
}

export async function getGradingQuestions(activityId: string): Promise<GradingQuestion[]> {
  return prisma.activityQuestion.findMany({
    where: { activityId },
    select: { id: true, question: true, correctAnswer: true },
    orderBy: { position: "asc" },
  });
}
