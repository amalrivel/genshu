import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/practice-run";
import {
  api,
  requireAuth,
  type PracticeSetForPractice,
  type PracticeSubmission,
} from "../content-api";
import { ContentError } from "../content-form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogPrimitive,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

type Draft = {
  practiceSetId: number;
  questionIds: number[];
  currentIndex: number;
  answers: Record<string, boolean>;
};
type LastResult = Pick<
  PracticeSubmission,
  "total" | "correct" | "incorrect" | "unanswered"
> & { submittedAt: string };
function key(
  userId: number,
  practiceSetId: number,
  name: "practice" | "last-result",
) {
  return `genshu:${name}:${userId}:${practiceSetId}`;
}
function read<T>(storageKey: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}
function draftFor(
  userId: number,
  practiceSet: PracticeSetForPractice,
): Draft | null {
  if (typeof window === "undefined") return null;
  const storageKey = key(userId, practiceSet.id, "practice");
  const draft = read<Draft>(storageKey);
  const questionIds = practiceSet.questions.map((question) => question.id);
  if (
    !draft ||
    draft.practiceSetId !== practiceSet.id ||
    !Array.isArray(draft.questionIds) ||
    draft.questionIds.join(",") !== questionIds.join(",") ||
    !Number.isInteger(draft.currentIndex) ||
    draft.currentIndex < 0 ||
    draft.currentIndex >= questionIds.length ||
    !draft.answers ||
    typeof draft.answers !== "object" ||
    Object.entries(draft.answers).some(
      ([questionId, answer]) =>
        !questionIds.includes(Number(questionId)) ||
        typeof answer !== "boolean",
    )
  ) {
    window.localStorage.removeItem(storageKey);
    return null;
  }
  return draft;
}
function answerLabel(answer: boolean | null) {
  return answer === null ? "Unanswered" : answer ? "○ Maru" : "× Batsu";
}

export const meta = () => [{ title: "Practice runner · Genshu" }];
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const user = await requireAuth();
  const practiceSet = await api<PracticeSetForPractice>(
    `/practice-sets/${encodeURIComponent(params.practiceSetId)}/practice`,
  );
  return { user, practiceSet };
}
export function HydrateFallback() {
  return (
    <main className="practice-page">
      <p role="status">Loading practice…</p>
    </main>
  );
}

export default function PracticeRun({ loaderData }: Route.ComponentProps) {
  const { practiceSet, user } = loaderData;
  const storageKey = key(user.id, practiceSet.id, "practice");
  const lastResultKey = key(user.id, practiceSet.id, "last-result");
  const [savedDraft] = useState(() => draftFor(user.id, practiceSet));
  const [started, setStarted] = useState(!savedDraft);
  const [index, setIndex] = useState(savedDraft?.currentIndex ?? 0);
  const [answers, setAnswers] = useState<Record<string, boolean>>(
    savedDraft?.answers ?? {},
  );
  const [result, setResult] = useState<PracticeSubmission | null>(null);
  const [reviewAll, setReviewAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [showFurigana, setShowFurigana] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("genshu-show-furigana") === "true",
  );
  const lastResult = read<LastResult>(lastResultKey);
  const question = practiceSet.questions[index];
  const answered = Object.keys(answers).length;
  const unanswered = practiceSet.questions.length - answered;
  function save(nextAnswers: Record<string, boolean>, nextIndex = index) {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        practiceSetId: practiceSet.id,
        questionIds: practiceSet.questions.map((item) => item.id),
        currentIndex: nextIndex,
        answers: nextAnswers,
      }),
    );
  }
  function move(nextIndex: number) {
    setIndex(nextIndex);
    save(answers, nextIndex);
  }
  function choose(answer: boolean) {
    const nextAnswers = { ...answers, [question.id]: answer };
    setAnswers(nextAnswers);
    save(nextAnswers);
  }
  function toggleFurigana() {
    setShowFurigana((value) => {
      window.localStorage.setItem("genshu-show-furigana", String(!value));
      return !value;
    });
  }
  async function submit() {
    setConfirmOpen(false);
    setSubmitting(true);
    setError("");
    try {
      const submitted = await api<PracticeSubmission>(
        `/practice-sets/${practiceSet.id}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: Object.entries(answers).map(([questionId, answer]) => ({
              questionId: Number(questionId),
              answer,
            })),
          }),
        },
      );
      window.localStorage.removeItem(storageKey);
      window.localStorage.setItem(
        lastResultKey,
        JSON.stringify({
          total: submitted.total,
          correct: submitted.correct,
          incorrect: submitted.incorrect,
          unanswered: submitted.unanswered,
          submittedAt: new Date().toISOString(),
        }),
      );
      setResult(submitted);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to submit answers.",
      );
    } finally {
      setSubmitting(false);
    }
  }
  function startOver() {
    window.localStorage.removeItem(storageKey);
    setAnswers({});
    setIndex(0);
    setStarted(true);
  }
  const back = (
    <Link className="practice-page__back" to="/practice">
      ← Practice sets
    </Link>
  );

  if (!practiceSet.questions.length)
    return (
      <>
        <main className="practice-page">
          {back}
          <h1>{practiceSet.title}</h1>
          <p className="page-intro">This practice set has no questions yet.</p>
        </main>
      </>
    );
  if (!started)
    return (
      <>
        <main className="practice-page runner-shell">
          {back}
          <Card className="draft-card">
            <CardHeader>
              <CardTitle>
                <h1>Continue practice?</h1>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                You have an unfinished draft for{" "}
                <strong>{practiceSet.title}</strong>.
              </p>
              <div className="practice-actions">
                <Button
                  className="submit-action"
                  size="lg"
                  onClick={() => setStarted(true)}
                >
                  Continue
                </Button>
                <Button
                  className="submit-action"
                  variant="outline"
                  size="lg"
                  onClick={startOver}
                >
                  Start over
                </Button>
              </div>
              {lastResult && (
                <p className="muted-copy">
                  Last result: {lastResult.correct} / {lastResult.total} correct
                  · {new Date(lastResult.submittedAt).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </>
    );

  if (result) {
    const feedback = new Map(
      result.answers.map((answer) => [answer.questionId, answer]),
    );
    const reviewed = reviewAll
      ? practiceSet.questions
      : practiceSet.questions.filter(
          (item) => !feedback.get(item.id)?.isCorrect,
        );
    const reviewItems = reviewed.map((item) => {
      const answer = feedback.get(item.id)!;
      return (
        <article
          className={`practice-question review-card${answer.isCorrect ? " review-card--correct" : ""}`}
          key={item.id}
        >
          <Badge variant={answer.isCorrect ? "secondary" : "destructive"}>
            {answer.isCorrect
              ? "Correct"
              : answer.answer === null
                ? "Unanswered"
                : "Incorrect"}
          </Badge>
          <p className="japanese-question" lang="ja">
            {item.japaneseText}
          </p>
          {showFurigana && item.furigana && (
            <p className="furigana" lang="ja">
              Furigana: {item.furigana}
            </p>
          )}
          <p className="translation" lang="id">
            {item.indonesianTranslation}
          </p>
          <div className="answer-comparison">
            <p>
              <strong>Your answer:</strong> {answerLabel(answer.answer)}
            </p>
            <p>
              <strong>Correct answer:</strong>{" "}
              {answerLabel(answer.correctAnswer)}
            </p>
          </div>
          <div className="explanation">
            <h3>Japanese explanation</h3>
            <p lang="ja">{answer.japaneseExplanation}</p>
            <h3>Penjelasan Bahasa Indonesia</h3>
            <p lang="id">{answer.indonesianExplanation}</p>
          </div>
        </article>
      );
    });
    const score = Math.round((result.correct / result.total) * 100) || 0;
    return (
      <>
        <main className="practice-page runner-shell">
          {back}
          <div className="practice-page__header">
            <div>
              <p className="page-eyebrow">Practice complete</p>
              <h1>{practiceSet.title}</h1>
            </div>
            <Button
              className="furigana-toggle"
              variant="outline"
              aria-pressed={showFurigana}
              onClick={toggleFurigana}
            >
              Furigana: {showFurigana ? "shown" : "hidden"}
            </Button>
          </div>
          <section className="result-summary" aria-label="Result summary">
            <div className="result-summary__score">
              <span>Score</span>
              <strong>{score}%</strong>
              <span>
                {result.correct} of {result.total} correct
              </span>
            </div>
            <div className="result-summary__item">
              <span>Correct</span>
              <strong>{result.correct}</strong>
            </div>
            <div className="result-summary__item">
              <span>Incorrect</span>
              <strong>{result.incorrect}</strong>
            </div>
            <div className="result-summary__item">
              <span>Unanswered</span>
              <strong>{result.unanswered}</strong>
            </div>
          </section>
          <Tabs
            className="review-tabs"
            value={reviewAll ? "all" : "review"}
            onValueChange={(value) => setReviewAll(value === "all")}
          >
            <TabsList aria-label="Result review">
              <TabsTrigger value="review">Incorrect + unanswered</TabsTrigger>
              <TabsTrigger value="all">All questions</TabsTrigger>
            </TabsList>
            <TabsContent value={reviewAll ? "all" : "review"}>
              <div className="review-list">{reviewItems}</div>
              {!reviewItems.length && <p>Perfect score.</p>}
            </TabsContent>
          </Tabs>
          <Button
            render={<Link to={`/practice/${practiceSet.id}`} />}
            size="lg"
          >
            Practice again
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="practice-page runner-shell">
        {back}
        <div className="runner-topline">
          <p className="runner-progress">
            <strong>Question {index + 1}</strong> /{" "}
            {practiceSet.questions.length} · {answered} answered
          </p>
          <Button
            className="furigana-toggle"
            variant="outline"
            aria-pressed={showFurigana}
            onClick={toggleFurigana}
          >
            Furigana: {showFurigana ? "shown" : "hidden"}
          </Button>
        </div>
        <Progress
          value={(answered / practiceSet.questions.length) * 100}
          aria-label={`${answered} of ${practiceSet.questions.length} questions answered`}
        />
        <div className="question-palette" aria-label="Question navigation">
          {practiceSet.questions.map((item, itemIndex) => {
            const current = itemIndex === index;
            const isAnswered = answers[item.id] !== undefined;
            const state = current
              ? "current"
              : isAnswered
                ? "answered"
                : "unanswered";
            return (
              <button
                key={item.id}
                type="button"
                className={state}
                aria-current={current ? "step" : undefined}
                aria-label={`Question ${itemIndex + 1}: ${state}`}
                onClick={() => move(itemIndex)}
              >
                {itemIndex + 1}
                {isAnswered && (
                  <span className="question-palette__mark" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <section
          className="practice-question"
          aria-label={`Question ${index + 1}`}
        >
          <div className="question-meta">
            <Badge
              variant={
                answers[question.id] === undefined ? "outline" : "secondary"
              }
            >
              {answers[question.id] === undefined ? "Unanswered" : "Answered"}
            </Badge>
            <span className="muted-copy">Choose one answer</span>
          </div>
          <p className="japanese-question" lang="ja">
            {question.japaneseText}
          </p>
          {showFurigana && question.furigana && (
            <p className="furigana" lang="ja">
              Furigana: {question.furigana}
            </p>
          )}
          <p className="translation" lang="id">
            {question.indonesianTranslation}
          </p>
          <div className="answer-options" aria-label="Choose an answer">
            <button
              type="button"
              aria-pressed={answers[question.id] === true}
              className={answers[question.id] === true ? "selected" : ""}
              onClick={() => choose(true)}
            >
              <span className="answer-symbol" aria-hidden="true">
                ○
              </span>
              Maru
            </button>
            <button
              type="button"
              aria-pressed={answers[question.id] === false}
              className={answers[question.id] === false ? "selected" : ""}
              onClick={() => choose(false)}
            >
              <span className="answer-symbol" aria-hidden="true">
                ×
              </span>
              Batsu
            </button>
          </div>
          <div className="practice-actions">
            <div className="practice-actions__navigation">
              <Button
                variant="outline"
                size="lg"
                disabled={index === 0}
                onClick={() => move(index - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="lg"
                disabled={index === practiceSet.questions.length - 1}
                onClick={() => move(index + 1)}
              >
                Next
              </Button>
            </div>
            <Button
              className="submit-action"
              size="lg"
              disabled={submitting}
              onClick={() => setConfirmOpen(true)}
            >
              {submitting ? "Submitting…" : "Submit answers"}
            </Button>
          </div>
          {error && (
            <p className="runner-error" role="alert">
              {error}
            </p>
          )}
        </section>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogPortal>
            <AlertDialogPrimitive.Backdrop className="alert-dialog__backdrop" />
            <AlertDialogPrimitive.Viewport className="alert-dialog__viewport">
              <AlertDialogContent>
                <AlertDialogTitle>Submit your answers?</AlertDialogTitle>
                <AlertDialogDescription>
                  {unanswered
                    ? `${unanswered} question${unanswered === 1 ? " is" : "s are"} still unanswered. They will count as incorrect.`
                    : "Your answers will be scored now."}
                </AlertDialogDescription>
                <div className="alert-dialog__actions">
                  <AlertDialogPrimitive.Close className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 font-medium hover:bg-muted">
                    Keep practicing
                  </AlertDialogPrimitive.Close>
                  <Button size="lg" onClick={submit}>
                    Submit answers
                  </Button>
                </div>
              </AlertDialogContent>
            </AlertDialogPrimitive.Viewport>
          </AlertDialogPortal>
        </AlertDialog>
      </main>
    </>
  );
}

export { ContentError as ErrorBoundary };
