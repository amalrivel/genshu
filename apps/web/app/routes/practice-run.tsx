import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/practice-run";
import { api, type AnswerFeedback, type PracticeSetForPractice } from "../content-api";
import { ContentError } from "../content-form";

type Answer = { questionId: number; isCorrect: boolean };

export const meta = () => [{ title: "Practice runner · Genshu" }];
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return api<PracticeSetForPractice>(`/practice-sets/${encodeURIComponent(params.practiceSetId)}/practice`);
}
export function HydrateFallback() { return <main className="practice-page"><p role="status">Loading practice…</p></main>; }

export default function PracticeRun({ loaderData }: Route.ComponentProps) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [showFurigana, setShowFurigana] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("genshu-show-furigana") === "true");
  const question = loaderData.questions[index];
  const correct = answers.filter((item) => item.isCorrect).length;

  function toggleFurigana() {
    setShowFurigana((value) => {
      window.localStorage.setItem("genshu-show-furigana", String(!value));
      return !value;
    });
  }

  async function confirmAnswer() {
    if (answer === null || !question) return;
    setChecking(true);
    setError("");
    try {
      const result = await api<AnswerFeedback>(`/practice-sets/${loaderData.id}/questions/${question.id}/check-answer`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer }),
      });
      setFeedback(result);
      setAnswers((items) => [...items, { questionId: question.id, isCorrect: result.isCorrect }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to check the answer.");
    } finally {
      setChecking(false);
    }
  }

  function next() {
    setIndex((value) => value + 1);
    setAnswer(null);
    setFeedback(null);
    setError("");
  }

  function restart() {
    setIndex(0);
    setAnswer(null);
    setFeedback(null);
    setAnswers([]);
    setError("");
  }

  if (!loaderData.questions.length) return <main className="practice-page"><nav><Link to="/practice">← Practice sets</Link></nav><h1>{loaderData.title}</h1><p>This practice set has no questions yet.</p></main>;
  if (index >= loaderData.questions.length) {
    const incorrect = answers.filter((item) => !item.isCorrect).map((item) => loaderData.questions.find((question) => question.id === item.questionId)!);
    const percentage = Math.round((correct / loaderData.questions.length) * 100);
    return <main className="practice-page">
      <nav><Link to="/practice">← Practice sets</Link></nav>
      <h1>Practice complete</h1>
      <h2>{loaderData.title}</h2>
      <p className="score">{correct} / {loaderData.questions.length} correct ({percentage}%)</p>
      {incorrect.length ? <><h3>Review incorrect answers</h3><ol className="incorrect-questions">{incorrect.map((item) => <li key={item.id}><span lang="ja">{item.japaneseText}</span><span lang="id">{item.indonesianTranslation}</span></li>)}</ol></> : <p>Perfect score.</p>}
      <button type="button" className="practice-link" onClick={restart}>Practice again</button>
    </main>;
  }

  return <main className="practice-page">
    <nav><Link to="/practice">← Practice sets</Link></nav>
    <p className="progress">Question {index + 1} of {loaderData.questions.length}</p>
    <h1>{loaderData.title}</h1>
    <button type="button" className="furigana-toggle" aria-pressed={showFurigana} onClick={toggleFurigana}>
      Furigana: {showFurigana ? "shown" : "hidden"}
    </button>
    <section className="practice-question" aria-label={`Question ${index + 1}`}>
      <p className="japanese-question" lang="ja">{question.japaneseText}</p>
      {showFurigana && question.furigana && <p className="furigana" lang="ja">Furigana: {question.furigana}</p>}
      <p lang="id">{question.indonesianTranslation}</p>
      <div className="answer-options" aria-label="Choose an answer">
        <button type="button" aria-pressed={answer === true} className={answer === true ? "selected" : ""} disabled={Boolean(feedback) || checking} onClick={() => setAnswer(true)}>○ Maru</button>
        <button type="button" aria-pressed={answer === false} className={answer === false ? "selected" : ""} disabled={Boolean(feedback) || checking} onClick={() => setAnswer(false)}>× Batsu</button>
      </div>
      {!feedback && <button type="button" className="practice-link" disabled={answer === null || checking} onClick={confirmAnswer}>{checking ? "Checking…" : "Confirm answer"}</button>}
      {error && <p role="alert">{error}</p>}
      {feedback && <section className={`feedback ${feedback.isCorrect ? "correct" : "incorrect"}`} role="status">
        <h2>{feedback.isCorrect ? "Correct" : "Incorrect"}</h2>
        <p>The correct answer is {feedback.correctAnswer ? "○ Maru" : "× Batsu"}.</p>
        <h3>Japanese explanation</h3><p lang="ja">{feedback.japaneseExplanation}</p>
        <h3>Penjelasan Bahasa Indonesia</h3><p lang="id">{feedback.indonesianExplanation}</p>
        <button type="button" className="practice-link" onClick={next}>{index + 1 === loaderData.questions.length ? "See results" : "Next question"}</button>
      </section>}
    </section>
  </main>;
}

export { ContentError as ErrorBoundary };
