// src/components/activities/activity-runner.tsx

"use client";

import {
  useState,
  useTransition,
} from "react";

import { Button } from "@/components/ui/button";

import { useActivity } from "@/hooks/activities/use-activity";

import {
  submitActivity,
} from "@/lib/activities/actions";

import type {
  Activity,
  ActivityResult,
} from "@/lib/activities/types";

import {
  ActivityResultView,
} from "./activity-result";

import {
  QuestionCard,
} from "./question-card";

// NOTE: Runner mengirim jawaban dan menampilkan hasil di halaman yang sama.
// Hasil berada di memori browser dan hilang saat halaman dimuat ulang.
export function ActivityRunner({
  activity,
}: {
  activity: Activity;
}) {
  const [
    result,
    setResult,
  ] =
    useState<ActivityResult | null>(
      null,
    );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const {
    currentQuestionIndex,
    currentQuestion,

    answers,

    isFirstQuestion,
    isLastQuestion,

    answer,
    next,
    previous,
    reset,
  } = useActivity(activity);

  function handleSubmit() {
    startTransition(
      async () => {
        const result =
          await submitActivity(
            activity.id,
            answers,
          );

        setResult(result);
      },
    );
  }

  function handleRetry() {
    reset();
    setResult(null);
  }

  if (result) {
    return (
      <ActivityResultView
        result={result}
        onRetry={handleRetry}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <p>
        No questions available.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p>{activity.type}</p>

        <h1>{activity.title}</h1>

        <p>
          {activity.description}
        </p>
      </header>

      <div>
        <p>
          Question{" "}
          {currentQuestionIndex +
            1}{" "}
          of{" "}
          {
            activity.questions
              .length
          }
        </p>
      </div>

      <QuestionCard
        question={
          currentQuestion.question
        }
        answer={
          answers[
            currentQuestion.id
          ]
        }
        onAnswer={answer}
      />

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={
            isFirstQuestion
          }
          onClick={previous}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {!isLastQuestion && (
            <Button
              type="button"
              onClick={next}
            >
              Next
            </Button>
          )}

          <Button
            type="button"
            disabled={isPending}
            onClick={
              handleSubmit
            }
          >
            {isPending
              ? "Submitting..."
              : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
