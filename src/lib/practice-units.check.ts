import assert from "node:assert/strict"
import type { PracticeQuestion, PracticeQuestionGroup } from "@/lib/content-types"
import { buildPracticeUnits, countPublishedPracticeQuestions, hasCompletePublishedGroup, scorePracticeUnits } from "@/lib/practice-units"

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
assert.deepEqual(buildPracticeUnits([question("q2", "g", 1), question("q3", "g", 2), question("q1", "g", 0)], [group]).map((unit) => unit.questions.map((child) => child.id)), [["q1", "q2", "q3"]])
assert.equal(hasCompletePublishedGroup([question("q3", "g", 2), question("q1", "g", 0), question("q2", "g", 1)]), true)

const units = buildPracticeUnits(groupQuestions(), [group])
assert.deepEqual(scorePracticeUnits(units, { q1: 0, q2: 0, q3: 0 }), { correctCount: 3, totalQuestions: 3, score: 2, maximum: 2 })
assert.deepEqual(scorePracticeUnits(units, { q1: 0, q2: 1, q3: 0 }), { correctCount: 2, totalQuestions: 3, score: 0, maximum: 2 })
assert.deepEqual(scorePracticeUnits(units, { q1: 0, q2: 0 }), { correctCount: 2, totalQuestions: 3, score: 0, maximum: 2 })
const mixed = buildPracticeUnits([question("standard"), ...groupQuestions()], [group])
assert.deepEqual(scorePracticeUnits(mixed, { standard: 0, q1: 0, q2: 0, q3: 0 }), { correctCount: 4, totalQuestions: 4, score: 3, maximum: 3 })
assert.deepEqual(scorePracticeUnits(mixed, { standard: 0, q1: 0, q2: 1, q3: 0 }), { correctCount: 3, totalQuestions: 4, score: 1, maximum: 3 })

const catalogGroups = [{ id: "g", practiceSetId: "group-only" }]
const catalogQuestions = [2, 0, 1].map((position) => ({ practiceSetId: "group-only", groupId: "g", groupPosition: position, isPublished: true }))
assert.deepEqual([...countPublishedPracticeQuestions(catalogQuestions, catalogGroups)], [["group-only", 3]])
assert.deepEqual([...countPublishedPracticeQuestions([...catalogQuestions, { practiceSetId: "plain", groupId: null, groupPosition: null, isPublished: true }], catalogGroups)], [["plain", 1], ["group-only", 3]])
assert.deepEqual([...countPublishedPracticeQuestions(catalogQuestions.slice(1), catalogGroups)], [])
assert.deepEqual([...countPublishedPracticeQuestions([...catalogQuestions, { practiceSetId: "group-only", groupId: "g", groupPosition: 1, isPublished: false }], catalogGroups)], [])
assert.deepEqual([...countPublishedPracticeQuestions(catalogQuestions.map((row) => ({ ...row, practiceSetId: "other-set" })), catalogGroups)], [])
console.log("Practice grouping and scoring checks passed.")
