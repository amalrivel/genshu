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
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    if (isPending) return;
    setSubmitError(null);
    startTransition(
      async () => {
        // NOTE: Kegagalan event submit ditangani di sini, bukan lewat error.tsx.
        // Jangan reset hook ketika gagal: pengguna harus bisa mengirim ulang
        // jawaban yang sama tanpa mengulang pengerjaan. Pesan driver/database
        // tidak ditampilkan karena bisa memuat detail internal atau kredensial.
        try {
          const result = await submitActivity(activity.id, answers);
          setResult(result);
        } catch {
          setSubmitError("Could not submit your answers. Your answers are still here. Please try submitting again.");
        }
        // TODO: Saat attempt disimpan, server perlu menangani submit idempotent.
        // Tombol disabled hanya menjaga UI; koneksi terputus setelah penyimpanan
        // bisa membuat pengguna mengirim ulang attempt yang sebenarnya berhasil.
      },
    );
  }

  function handleRetry() {
    reset();
    setResult(null);
    setSubmitError(null);
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
    <div className="space-y-6" aria-busy={isPending}>
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
        disabled={isPending}
      />

      {submitError ? <p role="alert">{submitError}</p> : null}
      {isPending ? <p role="status">Submitting your answers...</p> : null}

      {/* NOTE: Bekukan jawaban dan navigasi selama submit supaya tampilan tetap
          sesuai dengan snapshot jawaban yang dikirim. Ini bukan pengganti
          validasi atau pembatasan percobaan di server. */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={
            isFirstQuestion || isPending
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
              disabled={isPending}
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
