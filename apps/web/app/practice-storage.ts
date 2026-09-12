import type { PracticeSetSummary, PracticeSubmission } from "./content-api";

export type PracticeDraft = {
  practiceSetId: number;
  questionIds: number[];
  currentIndex: number;
  answers: Record<string, boolean>;
};
export type LastResult = Pick<
  PracticeSubmission,
  "total" | "correct" | "incorrect" | "unanswered"
> & { submittedAt: string };

export function practiceStorageKey(
  userId: number,
  practiceSetId: number,
  name: "practice" | "last-result",
) {
  return `genshu:${name}:${userId}:${practiceSetId}`;
}

export function readLocal<T>(storageKey: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(storageKey);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function readPracticeDraft(userId: number, practiceSetId: number) {
  const storageKey = practiceStorageKey(userId, practiceSetId, "practice");
  const draft = readLocal<PracticeDraft>(storageKey);
  if (
    !draft ||
    draft.practiceSetId !== practiceSetId ||
    !Array.isArray(draft.questionIds) ||
    !Number.isInteger(draft.currentIndex) ||
    draft.currentIndex < 0 ||
    !draft.answers ||
    typeof draft.answers !== "object" ||
    Object.entries(draft.answers).some(
      ([questionId, answer]) =>
        !Number.isInteger(Number(questionId)) || typeof answer !== "boolean",
    )
  ) {
    if (typeof window !== "undefined")
      window.localStorage.removeItem(storageKey);
    return null;
  }
  return draft;
}

export function findPracticeDraft(
  userId: number,
  practiceSets: PracticeSetSummary[],
) {
  for (const practiceSet of practiceSets) {
    const draft = readPracticeDraft(userId, practiceSet.id);
    if (draft) return { practiceSet, draft };
  }
  return null;
}

export function readLastResult(userId: number, practiceSetId: number) {
  const result = readLocal<LastResult>(
    practiceStorageKey(userId, practiceSetId, "last-result"),
  );
  return result &&
    [result.total, result.correct, result.incorrect, result.unanswered].every(
      (value) => Number.isInteger(value) && value >= 0,
    ) &&
    typeof result.submittedAt === "string"
    ? result
    : null;
}
