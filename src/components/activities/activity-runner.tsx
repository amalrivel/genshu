"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useActivity } from "@/hooks/activities/use-activity";
import { saveAttempt, startPractice, submitAttempt } from "@/lib/activities/actions";
import type { Activity, ActivityResult, Answers } from "@/lib/activities/types";
import { ActivityResultView } from "./activity-result";
import { QuestionCard } from "./question-card";

export function ActivityRunner({
  activity,
  attemptId,
  initialAnswers,
  initialResult,
}: {
  activity: Activity;
  attemptId: string;
  initialAnswers: Answers;
  initialResult: ActivityResult | null;
}) {
  const router = useRouter();
  const [result, setResult] = useState<ActivityResult | null>(initialResult);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("Draft saved");
  const [isPending, startTransition] = useTransition();
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const sequence = useRef(0);
  const {
    currentQuestionIndex,
    currentQuestion,
    answers,
    isFirstQuestion,
    isLastQuestion,
    answer,
    next,
    previous,
  } = useActivity(activity, initialAnswers);

  useEffect(() => {
    if (result) return;
    const version = ++sequence.current;
    const timer = setTimeout(() => {
      setSaveStatus("Saving draft…");
      const snapshot = answers;
      queue.current = queue.current.catch(() => undefined).then(async () => {
        try {
          await saveAttempt(attemptId, snapshot);
          if (sequence.current === version) setSaveStatus("Draft saved");
        } catch {
          if (sequence.current === version) setSaveStatus("Draft not saved. Your answers are still on this page; try again.");
        }
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [answers, attemptId, result]);

  function handleSubmit() {
    if (isPending) return;
    setSubmitError(null);
    startTransition(async () => {
      try {
        await queue.current.catch(() => undefined);
        const saved = await submitAttempt(attemptId, answers);
        setResult(saved);
      } catch {
        setSubmitError("Could not submit your answers. They are still here. Please try again.");
      }
    });
  }

  function handleRetry() {
    startTransition(async () => {
      const nextAttempt = await startPractice(activity.id);
      router.replace(`/activities/${activity.id}?attempt=${nextAttempt.attemptId}`);
      router.refresh();
    });
  }

  if (result) return <ActivityResultView result={result} onRetry={handleRetry} />;
  if (!currentQuestion) return <p>No questions are available for this practice.</p>;

  return (
    <section className="space-y-6" aria-busy={isPending}>
      <header>
        <p>Practice</p>
        <h1 className="text-2xl font-semibold">{activity.title}</h1>
        <p>{activity.description}</p>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p>Question {currentQuestionIndex + 1} of {activity.questions.length}</p>
        <p role="status" aria-live="polite">{saveStatus}</p>
      </div>
      <QuestionCard question={currentQuestion.question} answer={answers[currentQuestion.id]} onAnswer={answer} disabled={isPending} />
      {submitError ? <p role="alert">{submitError}</p> : null}
      {isPending ? <p role="status">Saving your result…</p> : null}
      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" disabled={isFirstQuestion || isPending} onClick={previous}>Previous</Button>
        <div className="flex gap-2">
          {!isLastQuestion ? <Button type="button" onClick={next} disabled={isPending}>Next</Button> : null}
          <Button type="button" disabled={isPending} onClick={handleSubmit}>{isPending ? "Submitting…" : "Submit"}</Button>
        </div>
      </div>
    </section>
  );
}
