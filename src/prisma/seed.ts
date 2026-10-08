import "dotenv/config";
import { prisma } from "../lib/db";
import { activityTypes } from "../lib/activities/activity-types";
import { activities, type InternalActivity } from "../lib/activities/data";

// NOTE: Illustrative test content, not validated learning/exam material.
const examples: InternalActivity[] = [
  ...activities,
  {
    id: "demo-exam-01", title: "Demo Exam", type: "exam",
    description: "Seed example for testing the exam category.",
    questions: [
      { id: "q1", question: "Drivers must obey traffic signals.", correctAnswer: true },
      { id: "q2", question: "Checking for pedestrians before turning is unnecessary.", correctAnswer: false },
    ],
  },
  {
    id: "demo-assignment-01", title: "Demo Homework", type: "assignment",
    description: "Seed example for testing the homework category.",
    questions: [
      { id: "q1", question: "A No Entry sign prohibits entry.", correctAnswer: true },
      { id: "q2", question: "Traffic rules only apply when other vehicles are present.", correctAnswer: false },
    ],
  },
];

async function main() {
  // NOTE: Existing records are preserved (create-only upserts), including edits
  // made after seeding. No reset, deletion, users, sessions, or attempts.
  await prisma.$transaction(async (tx) => {
    for (const category of activityTypes) {
      await tx.activityCategory.upsert({
        where: { id: category.id }, create: category, update: {},
      });
    }
    for (const { questions, ...activity } of examples) {
      const existing = await tx.activity.findUnique({ where: { id: activity.id }, select: { id: true } });
      // Treat each existing activity as user-owned; do not add/reorder its questions.
      if (existing) continue;
      await tx.activity.create({
        data: {
          ...activity,
          questions: { create: questions.map((question, position) => ({ ...question, position })) },
        },
      });
    }
  });
  console.log("Seed complete: 4 master categories and 4 example activities ensured; existing records preserved.");
  // TODO: Seed accounts through Better Auth once login and role policy are decided.
}

try {
  await main();
} catch {
  // Avoid printing driver errors that could expose connection details.
  console.error("Seed failed. Check MariaDB connectivity and apply migrations with bun run db:deploy.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
