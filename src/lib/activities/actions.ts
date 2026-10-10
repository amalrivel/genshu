"use server";

// NOTE: Server Action adalah pintu masuk jaringan, sehingga tipe TypeScript dan
// kontrol disabled di UI tidak cukup: payload tetap divalidasi di server.
// TODO: Periksa session serta hak akses di action ini sebelum pemakaian nyata.
// TODO: Simpan attempt, jawaban, dan hasil dalam satu transaksi agar kegagalan
// tidak menghasilkan riwayat parsial. Beri identitas submit yang stabil supaya
// retry setelah gangguan jaringan tidak membuat hasil tersimpan dua kali.


import { getActivity, getGradingQuestions } from "./queries";
import { gradeActivity } from "./grading";
import type { ActivityResult, Answers } from "./types";

export async function submitActivity(
  activityId: string,
  answers: Answers,
): Promise<ActivityResult> {
  if (typeof activityId !== "string" || !activityId ||
      !answers || typeof answers !== "object" || Array.isArray(answers) ||
      Object.values(answers).some((answer) => typeof answer !== "boolean")) {
    throw new Error("Invalid activity submission");
  }
  // TODO: Authenticate and validate practice attempt ownership/state; exam policies are deferred.
  const activity = await getActivity(activityId);
  if (!activity) throw new Error("Activity not found");
  const questions = await getGradingQuestions(activityId);
  const questionIds = new Set(questions.map((question) => question.id));
  if (Object.keys(answers).some((id) => !questionIds.has(id))) {
    throw new Error("Unknown question in submission");
  }
  const result = gradeActivity(activityId, questions, answers);
  // TODO: Persist the attempt and answers atomically once identity and schema are decided.
  // TODO: Show immediate saved feedback for practice; define disclosure rules before enabling exams.
  // NOTE: Results remain in browser memory; this action does not save them yet.
  return result;
}
