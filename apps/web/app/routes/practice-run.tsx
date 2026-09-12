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

function key(userId: number, practiceSetId: number, name: "practice" | "last-result") {
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
function draftFor(userId: number, practiceSet: PracticeSetForPractice): Draft | null {
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
        !questionIds.includes(Number(questionId)) || typeof answer !== "boolean",
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
  return <main className="practice-page"><p role="status">Loading practice…</p></main>;
}

export default function PracticeRun({ loaderData }: Route.ComponentProps) {
  const { practiceSet, user } = loaderData;
  const storageKey = key(user.id, practiceSet.id, "practice");
  const lastResultKey = key(user.id, practiceSet.id, "last-result");
  const [savedDraft] = useState(() => draftFor(user.id, practiceSet));
  const [started, setStarted] = useState(!savedDraft);
  const [index, setIndex] = useState(savedDraft?.currentIndex ?? 0);
  const [answers, setAnswers] = useState<Record<string, boolean>>(savedDraft?.answers ?? {});
  const [result, setResult] = useState<PracticeSubmission | null>(null);
  const [reviewAll, setReviewAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showFurigana, setShowFurigana] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("genshu-show-furigana") === "true",
  );
  const lastResult = read<LastResult>(lastResultKey);
  const question = practiceSet.questions[index];

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
    const unanswered = practiceSet.questions.length - Object.keys(answers).length;
    const message = unanswered
      ? `${unanswered} question${unanswered === 1 ? " is" : "s are"} still unanswered. Submit anyway?`
      : "Submit your answers?";
    if (!window.confirm(message)) return;
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
      setError(caught instanceof Error ? caught.message : "Unable to submit answers.");
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

  if (!practiceSet.questions.length)
    return <main className="practice-page"><nav><Link to="/practice">← Practice sets</Link></nav><h1>{practiceSet.title}</h1><p>This practice set has no questions yet.</p></main>;

  if (!started)
    return (
      <main className="practice-page">
        <nav><Link to="/practice">← Practice sets</Link></nav>
        <h1>{practiceSet.title}</h1>
        <p>You have an unfinished practice draft.</p>
        <div className="practice-actions">
          <button type="button" onClick={() => setStarted(true)}>Continue</button>
          <button type="button" onClick={startOver}>Start over</button>
        </div>
        {lastResult && <p>Last result: {lastResult.correct} / {lastResult.total} correct ({new Date(lastResult.submittedAt).toLocaleString()}).</p>}
      </main>
    );

  if (result) {
    const feedback = new Map(result.answers.map((answer) => [answer.questionId, answer]));
    const reviewed = reviewAll ? practiceSet.questions : practiceSet.questions.filter((item) => !feedback.get(item.id)?.isCorrect);
    return (
      <main className="practice-page">
        <nav><Link to="/practice">← Practice sets</Link></nav>
        <h1>Practice complete</h1>
        <h2>{practiceSet.title}</h2>
        <p className="score">{result.correct} / {result.total} correct ({Math.round((result.correct / result.total) * 100) || 0}%)</p>
        <p>Incorrect: {result.incorrect} · Unanswered: {result.unanswered}</p>
        <button type="button" className="furigana-toggle" aria-pressed={showFurigana} onClick={toggleFurigana}>Furigana: {showFurigana ? "shown" : "hidden"}</button>
        <div className="practice-actions">
          <button type="button" aria-pressed={!reviewAll} onClick={() => setReviewAll(false)}>Incorrect + unanswered</button>
          <button type="button" aria-pressed={reviewAll} onClick={() => setReviewAll(true)}>All questions</button>
        </div>
        {reviewed.map((item) => {
          const answer = feedback.get(item.id)!;
          return <section className="practice-question" key={item.id}>
            <p className="japanese-question" lang="ja">{item.japaneseText}</p>
            {showFurigana && item.furigana && <p className="furigana" lang="ja">Furigana: {item.furigana}</p>}
            <p lang="id">{item.indonesianTranslation}</p>
            <p>Your answer: {answerLabel(answer.answer)}</p>
            <p>Correct answer: {answerLabel(answer.correctAnswer)}</p>
            <h3>Japanese explanation</h3><p lang="ja">{answer.japaneseExplanation}</p>
            <h3>Penjelasan Bahasa Indonesia</h3><p lang="id">{answer.indonesianExplanation}</p>
          </section>;
        })}
        {!reviewed.length && <p>Perfect score.</p>}
        <button type="button" className="practice-link" onClick={startOver}>Practice again</button>
      </main>
    );
  }

  return (
    <main className="practice-page">
      <nav><Link to="/practice">← Practice sets</Link></nav>
      <p className="progress">Question {index + 1} / {practiceSet.questions.length}</p>
      <h1>{practiceSet.title}</h1>
      <button type="button" className="furigana-toggle" aria-pressed={showFurigana} onClick={toggleFurigana}>Furigana: {showFurigana ? "shown" : "hidden"}</button>
      <div className="question-palette" aria-label="Question navigation">
        {practiceSet.questions.map((item, itemIndex) => <button key={item.id} type="button" className={itemIndex === index ? "current" : answers[item.id] !== undefined ? "answered" : ""} aria-current={itemIndex === index ? "step" : undefined} onClick={() => move(itemIndex)}>{itemIndex + 1}</button>)}
      </div>
      <section className="practice-question" aria-label={`Question ${index + 1}`}>
        <p className="japanese-question" lang="ja">{question.japaneseText}</p>
        {showFurigana && question.furigana && <p className="furigana" lang="ja">Furigana: {question.furigana}</p>}
        <p lang="id">{question.indonesianTranslation}</p>
        <div className="answer-options" aria-label="Choose an answer">
          <button type="button" aria-pressed={answers[question.id] === true} className={answers[question.id] === true ? "selected" : ""} onClick={() => choose(true)}>○ Maru</button>
          <button type="button" aria-pressed={answers[question.id] === false} className={answers[question.id] === false ? "selected" : ""} onClick={() => choose(false)}>× Batsu</button>
        </div>
        <div className="practice-actions">
          <button type="button" disabled={index === 0} onClick={() => move(index - 1)}>Previous</button>
          <button type="button" disabled={index === practiceSet.questions.length - 1} onClick={() => move(index + 1)}>Next</button>
          <button type="button" className="practice-link" disabled={submitting} onClick={submit}>{submitting ? "Submitting…" : "Submit answers"}</button>
        </div>
        {error && <p role="alert">{error}</p>}
      </section>
    </main>
  );
}

export { ContentError as ErrorBoundary };
