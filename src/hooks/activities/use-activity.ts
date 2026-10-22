// src/hooks/activities/use-activity.ts

"use client";

// The hook restores answers from the server-provided attempt snapshot; persistence
// and permission checks stay in server actions.


import { useState } from "react";

import type {
  Activity,
  Answers,
} from "@/lib/activities/types";

// NOTE: Hook ini mengelola jawaban dan navigasi soal.
// Pengiriman jawaban dan tampilan hasil dikelola oleh runner.
export function useActivity(
  activity: Activity,
  initialAnswers: Answers = {},
) {
  const [
    currentQuestionIndex,
    setCurrentQuestionIndex,
  ] = useState(() => Math.max(0, activity.questions.findIndex((question) => typeof initialAnswers[question.id] !== "boolean")));

  const [answers, setAnswers] =
    useState<Answers>(initialAnswers);

  const currentQuestion =
    activity.questions[
      currentQuestionIndex
    ];

  const isFirstQuestion =
    currentQuestionIndex === 0;

  const isLastQuestion =
    currentQuestionIndex ===
    activity.questions.length - 1;

  function answer(
    value: boolean,
  ) {
    if (!currentQuestion) {
      return;
    }

    setAnswers((current) => ({
      ...current,

      [currentQuestion.id]:
        value,
    }));
  }

  function next() {
    setCurrentQuestionIndex(
      (current) =>
        Math.min(
          current + 1,
          activity.questions.length -
            1,
        ),
    );
  }

  function previous() {
    setCurrentQuestionIndex(
      (current) =>
        Math.max(
          current - 1,
          0,
        ),
    );
  }

  function goToQuestion(
    index: number,
  ) {
    if (
      index < 0 ||
      index >=
        activity.questions.length
    ) {
      return;
    }

    setCurrentQuestionIndex(index);
  }

  function reset() {
    setCurrentQuestionIndex(0);
    setAnswers({});
  }

  return {
    currentQuestionIndex,
    currentQuestion,

    answers,

    isFirstQuestion,
    isLastQuestion,

    answer,
    next,
    previous,
    goToQuestion,
    reset,
  };
}
