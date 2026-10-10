// NOTE: Fungsi murni ini menghitung skor tanpa mengakses database atau session,
// sehingga aturan penilaian bisa diuji terpisah dari transport dan penyimpanan.
// TODO: Penilaian attempt perlu memakai versi/snapshot soal saat mulai mengerjakan.
// Menggunakan kunci terbaru bisa mengubah hasil jika admin mengedit soal di tengah
// pengerjaan. V1 membuka feedback practice setelah submit tersimpan; aturan exam
// ditunda. Menyembunyikan kunci di UI tidak menyembunyikannya di respons jaringan.
// See docs/developer-guide.md, Activities.

import type { ActivityResult, Answers, Question } from "./types";

export type GradingQuestion = Question & { correctAnswer: boolean };

// NOTE: Pure scoring logic; it does not access the database or user session.
export function gradeActivity(
  activityId: string,
  questions: GradingQuestion[],
  answers: Answers,
): ActivityResult {
  const results = questions.map((question) => {
    const userAnswer = Object.prototype.hasOwnProperty.call(answers, question.id)
      ? answers[question.id]
      : null;
    return {
      questionId: question.id,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: userAnswer === question.correctAnswer,
    };
  });
  const total = results.length;
  const correct = results.filter((question) => question.isCorrect).length;
  const unanswered = results.filter((question) => question.userAnswer === null).length;
  return {
    activityId, total, correct, unanswered,
    incorrect: total - correct - unanswered,
    score: total === 0 ? 0 : Math.round((correct / total) * 100),
    questions: results,
  };
}
