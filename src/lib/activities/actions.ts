// src/lib/activities/actions.ts

// NOTE: Action ini menghitung hasil berdasarkan jawaban yang dikirim.
// TODO: Validasi user dan simpan attempt/jawaban setelah alur
// autentikasi dan penyimpanan diputuskan bersama pemilik proyek.

"use server";

import { activities } from "./data";

import type {
  ActivityResult,
  Answers,
} from "./types";

export async function submitActivity(
  activityId: string,
  answers: Answers,
): Promise<ActivityResult> {
  const activity =
    activities.find(
      (activity) =>
        activity.id === activityId,
    );

  if (!activity) {
    throw new Error(
      "Activity not found",
    );
  }

  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  const questionResults =
    activity.questions.map(
      (question) => {
        const hasAnswer =
          Object.prototype.hasOwnProperty.call(
            answers,
            question.id,
          );

        const userAnswer =
          hasAnswer
            ? answers[
                question.id
              ]
            : null;

        const isCorrect =
          userAnswer ===
          question.correctAnswer;

        if (
          userAnswer === null
        ) {
          unanswered += 1;
        } else if (
          isCorrect
        ) {
          correct += 1;
        } else {
          incorrect += 1;
        }

        return {
          questionId:
            question.id,

          userAnswer,

          correctAnswer:
            question.correctAnswer,

          isCorrect,
        };
      },
    );

  const total =
    activity.questions.length;

  const score =
    total === 0
      ? 0
      : Math.round(
          (correct / total) * 100,
        );

  return {
    activityId,

    total,
    correct,
    incorrect,
    unanswered,

    score,

    questions:
      questionResults,
  };
}
