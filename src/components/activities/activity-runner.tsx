"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CloudOff, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { useActivity } from "@/hooks/activities/use-activity";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { saveAttempt, startPractice, submitAttempt } from "@/lib/activities/actions";
import { createDraftSaver, type SaveStatus } from "@/lib/activities/draft-saver";
import type { Activity, ActivityResult, Answers } from "@/lib/activities/types";
import { ActivityResultView } from "./activity-result";
import { ActivityReviewDialog } from "./activity-review";
import { QuestionCard } from "./question-card";

export function ActivityRunner({ activity, attemptId, initialAnswers, initialResult }: {
  activity: Activity; attemptId: string; initialAnswers: Answers; initialResult: ActivityResult | null;
}) {
  const router = useRouter();
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [review, setReview] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const [pending, startTransition] = useTransition();
  const operation = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const reviewQuestionFocus = useRef(false);
  const saver = useRef<ReturnType<typeof createDraftSaver> | null>(null);
  const { currentQuestionIndex, currentQuestion, answers, isFirstQuestion, isLastQuestion, answer, goToQuestion } = useActivity(activity, initialAnswers);
  const answered = activity.questions.filter((question) => typeof answers[question.id] === "boolean").length;
  useUnsavedChanges(!result && saveStatus !== "saved");

  useEffect(() => {
    const draftSaver = createDraftSaver((snapshot) => saveAttempt(attemptId, snapshot), setSaveStatus);
    saver.current = draftSaver;
    return () => { draftSaver.dispose(); saver.current = null; };
  }, [attemptId]);

  useEffect(() => {
    if (focusRequest && !review) {
      heading.current?.focus();
      heading.current?.scrollIntoView({ block: "center" });
    }
  }, [currentQuestionIndex, focusRequest, review]);

  function choose(value: boolean) {
    if (!currentQuestion || pending) return;
    saver.current?.update({ ...answers, [currentQuestion.id]: value });
    answer(value);
  }
  function move(index: number) { goToQuestion(index); setFocusRequest((request) => request + 1); }
  function submit() {
    if (operation.current) return;
    operation.current = true;
    setError(null);
    startTransition(async () => {
      try {
        await saver.current?.flush().catch(() => undefined);
        setResult(await submitAttempt(attemptId, answers));
        setReview(false);
        setSaveStatus("saved");
      } catch { setReview(false); setError("Jawaban belum berhasil dikirim. Jawaban Anda tetap ada. Silakan coba lagi."); }
      finally { operation.current = false; }
    });
  }
  function retry() {
    if (operation.current) return;
    operation.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const attempt = await startPractice(activity.id);
        router.replace(`/activities/${activity.id}?attempt=${attempt.attemptId}`);
        router.refresh();
      } catch { setError("Latihan baru belum berhasil dibuka. Silakan coba lagi."); }
      finally { operation.current = false; }
    });
  }
  if (result) return <ActivityResultView activityTitle={activity.title} result={result} onRetry={retry} pending={pending} error={error} />;
  if (!currentQuestion) return <p>Belum ada soal untuk latihan ini.</p>;
  return <section className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-busy={pending}>
    <Link href="/activities" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft aria-hidden="true" className="size-4" />Kembali ke latihan</Link>
    <header className="page-header min-w-0"><p className="text-sm">Latihan mandiri</p><h1 className="break-words">{activity.title}</h1><p className="break-words">{activity.description}</p></header>
    <div className="flex flex-col gap-3">
      <Progress value={answered} max={activity.questions.length} aria-label="Soal terjawab"><ProgressLabel>{answered} dari {activity.questions.length} soal terjawab</ProgressLabel></Progress>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Soal {currentQuestionIndex + 1} dari {activity.questions.length}</p>
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === "saving" ? <Spinner aria-hidden="true" /> : saveStatus === "saved" ? <Check aria-hidden="true" className="size-4" /> : saveStatus === "error" ? <CloudOff aria-hidden="true" className="size-4" /> : null}
          {{ saved: "Tersimpan", unsaved: "Perubahan belum tersimpan", saving: "Menyimpan…", error: "Gagal menyimpan" }[saveStatus]}
        </p>
      </div>
      {saveStatus === "error" ? <Alert variant="destructive"><AlertDescription>Jawaban masih ada di halaman ini. <Button variant="link" disabled={pending} onClick={() => { void saver.current?.flush().catch(() => undefined); }}>Coba simpan lagi</Button></AlertDescription></Alert> : null}
    </div>
    <nav aria-label="Pilih nomor soal" className="flex flex-wrap gap-2">{activity.questions.map((question, index) => <Button key={question.id} className="relative" variant={index === currentQuestionIndex ? "default" : "outline"} size="icon" disabled={pending} aria-current={index === currentQuestionIndex ? "step" : undefined} aria-label={`Soal ${index + 1}, ${typeof answers[question.id] === "boolean" ? "sudah dijawab" : "belum dijawab"}`} onClick={() => move(index)}>{index + 1}{typeof answers[question.id] === "boolean" ? <Check aria-hidden="true" data-icon="inline-end" className="absolute right-0 bottom-0" /> : null}</Button>)}</nav>
    <div className="relative min-w-0">
      <h2 ref={heading} tabIndex={-1} className="sr-only">Soal {currentQuestionIndex + 1}. {currentQuestion.question}</h2>
      <QuestionCard key={currentQuestion.id} question={currentQuestion.question} answer={answers[currentQuestion.id]} onAnswer={choose} disabled={pending} />
    </div>
    {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
    <div className="flex flex-wrap justify-between gap-3">
      <Button variant="outline" disabled={isFirstQuestion || pending} onClick={() => move(currentQuestionIndex - 1)}><ArrowLeft aria-hidden="true" data-icon="inline-start" />Sebelumnya</Button>
      <Button variant="outline" disabled={isLastQuestion || pending} onClick={() => move(currentQuestionIndex + 1)}>Berikutnya<ArrowRight aria-hidden="true" data-icon="inline-end" /></Button>
      <Button disabled={pending} onClick={() => { reviewQuestionFocus.current = false; setReview(true); }}>Tinjau jawaban</Button>
    </div>
    <ActivityReviewDialog open={review} pending={pending} questions={activity.questions} answers={answers}
      onOpenChange={(value) => { if (!pending) setReview(value); }}
      onEdit={(index) => { reviewQuestionFocus.current = true; move(index); setReview(false); }}
      onSubmit={submit}
      finalFocus={() => reviewQuestionFocus.current ? heading.current : true}
    />
  </section>;
}
