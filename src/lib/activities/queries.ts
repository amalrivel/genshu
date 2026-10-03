// src/lib/activities/queries.ts

import { activities } from "./data";

import type {
  Activity,
  ActivitySummary,
} from "./types";

export async function getActivities(): Promise<
  ActivitySummary[]
> {
  return activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    type: activity.type,

    questionCount:
      activity.questions.length,
  }));
}

export async function getActivity(
  id: string,
): Promise<Activity | null> {
  const activity = activities.find(
    (activity) => activity.id === id,
  );

  if (!activity) {
    return null;
  }

  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    type: activity.type,

    // NOTE:
    // correctAnswer sengaja tidak dikirim.
    questions: activity.questions.map(
      (question) => ({
        id: question.id,
        question: question.question,
      }),
    ),
  };
}
