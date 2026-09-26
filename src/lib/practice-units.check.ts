import assert from "node:assert/strict"
import type { PracticeQuestion, PracticeQuestionGroup } from "@/lib/content-types"
import { buildPracticeUnits, scorePracticeUnits } from "@/lib/practice-units"

const question = (id: string, groupId: string | null = null, groupPosition: number | null = null, isPublished = true): PracticeQuestion => ({
  id, type: "TRUE_FALSE", prompt: id, promptPlain: id, translationId: "", options: ["○", "×"], correctAnswerIndex: 0,
  explanationJa: "説明", explanationId: "", explanationMarkup: "説明", context: "", contextMarkup: "", imageUrl: "",
  imageWidth: null, imageHeight: null, isPublished, sourceRef: id, sourceDigest: "digest", groupId, groupPosition,
})
const group: PracticeQuestionGroup = { id: "g", context: "共有", contextMarkup: "共有", imageUrl: "/gentsuki-quiz-assets/a.jpg", imageWidth: 10, imageHeight: 10 }
const groupQuestions = () => [question("q1", "g", 0), question("q2", "g", 1), question("q3", "g", 2)]

assert.deepEqual(
  buildPracticeUnits([question("before"), ...groupQuestions(), question("after")], [group]).map((unit) => unit.questions.map((q) => q.id)),
  [["before"], ["q1", "q2", "q3"], ["after"]],
)
assert.deepEqual(buildPracticeUnits([question("q1", "g", 0), question("q2", "g", 1)], [group]), [])
assert.deepEqual(buildPracticeUnits([question("q1", "g", 0), question("q2", "g", 1), question("q3", "g", 2, false)], [group]), [])
assert.deepEqual(buildPracticeUnits([question("q1", "g", 0), question("q2", "g", 2), question("q3", "g", 2)], [group]), [])

const units = buildPracticeUnits(groupQuestions(), [group])
assert.deepEqual(scorePracticeUnits(units, { q1: 0, q2: 0, q3: 0 }), { correctCount: 3, totalQuestions: 3, score: 2, maximum: 2 })
assert.deepEqual(scorePracticeUnits(units, { q1: 0, q2: 1, q3: 0 }), { correctCount: 2, totalQuestions: 3, score: 0, maximum: 2 })
assert.deepEqual(scorePracticeUnits(units, { q1: 0, q2: 0 }), { correctCount: 2, totalQuestions: 3, score: 0, maximum: 2 })
const mixed = buildPracticeUnits([question("standard"), ...groupQuestions()], [group])
assert.deepEqual(scorePracticeUnits(mixed, { standard: 0, q1: 0, q2: 0, q3: 0 }), { correctCount: 4, totalQuestions: 4, score: 3, maximum: 3 })
assert.deepEqual(scorePracticeUnits(mixed, { standard: 0, q1: 0, q2: 1, q3: 0 }), { correctCount: 3, totalQuestions: 4, score: 1, maximum: 3 })
console.log("Practice grouping and scoring checks passed.")
