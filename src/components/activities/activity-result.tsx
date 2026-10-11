// NOTE: Komponen ini hanya menampilkan hasil server, bukan menghitung ulang nilai.
// Retry creates a new server-owned practice attempt; deferred categories have no
// retry policy and are not exposed to students.

// src/components/activities/activity-result.tsx

import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

import type {
  ActivityResult,
} from "@/lib/activities/types";

export function ActivityResultView({
  result,
  onRetry,
}: {
  result: ActivityResult;

  onRetry: () => void;
}) {
  return (
    <section>
      <h1>Result</h1>

      <p className="mt-4 text-4xl font-bold">
        {result.score}%
      </p>

      <div className="mt-4 space-y-1">
        <p>
          Total: {result.total}
        </p>

        <p>
          Correct:{" "}
          {result.correct}
        </p>

        <p>
          Incorrect:{" "}
          {result.incorrect}
        </p>

        <p>
          Unanswered:{" "}
          {result.unanswered}
        </p>
      </div>

      <ol className="mt-6 space-y-3">
        {result.questions.map((question, index) => (
          <li key={question.questionId} className="rounded-lg border p-4">
            <h2 className="font-medium">{index + 1}. {question.question}</h2>
            <p>{question.isCorrect ? "Correct" : "Incorrect"}; your answer: {question.userAnswer === null ? "unanswered" : question.userAnswer ? "True" : "False"}</p>
            <p>Correct answer: {question.correctAnswer ? "True" : "False"}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={onRetry}>Try again</Button>
        <Link className={buttonVariants({ variant: "outline" })} href="/activities">Back to practice</Link>
      </div>
    </section>
  );
}
