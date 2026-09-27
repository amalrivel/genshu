import type { PracticeQuestion, PracticeQuestionGroup } from "@/lib/content-types"

export type PracticeUnit = {
  id: string
  questions: PracticeQuestion[]
  group?: PracticeQuestionGroup
}

type GroupChild = Pick<PracticeQuestion, "groupPosition" | "isPublished">

export function hasCompletePublishedGroup(children: GroupChild[]): boolean {
  return children.length === 3 && children.every((child) => child.isPublished)
    && children.map((child) => child.groupPosition).toSorted((a, b) => (a ?? -1) - (b ?? -1)).every((position, index) => position === index)
}

type CatalogQuestion = { practiceSetId: string; groupId: string | null; groupPosition: number | null; isPublished: boolean }
type CatalogGroup = { id: string; practiceSetId: string }

export function countPublishedPracticeQuestions(questions: CatalogQuestion[], groups: CatalogGroup[]): Map<string, number> {
  const counts = new Map<string, number>()
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const childrenByGroup = new Map<string, CatalogQuestion[]>()
  for (const question of questions) {
    if (!question.groupId) {
      if (question.isPublished) counts.set(question.practiceSetId, (counts.get(question.practiceSetId) ?? 0) + 1)
      continue
    }
    const children = childrenByGroup.get(question.groupId)
    if (children) children.push(question)
    else childrenByGroup.set(question.groupId, [question])
  }
  for (const [groupId, children] of childrenByGroup) {
    const group = groupsById.get(groupId)
    if (!group || children.some((child) => child.practiceSetId !== group.practiceSetId)
      || !hasCompletePublishedGroup(children)) continue
    counts.set(group.practiceSetId, (counts.get(group.practiceSetId) ?? 0) + children.length)
  }
  return counts
}

export function buildPracticeUnits(questions: PracticeQuestion[], groups: PracticeQuestionGroup[]): PracticeUnit[] {
  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const childrenByGroup = new Map<string, PracticeQuestion[]>()
  for (const question of questions) {
    if (!question.groupId) continue
    const children = childrenByGroup.get(question.groupId)
    if (children) children.push(question)
    else childrenByGroup.set(question.groupId, [question])
  }

  const units: PracticeUnit[] = []
  const visitedGroups = new Set<string>()
  for (const question of questions) {
    if (!question.groupId) {
      if (question.isPublished) units.push({ id: question.id, questions: [question] })
      continue
    }
    if (visitedGroups.has(question.groupId)) continue
    visitedGroups.add(question.groupId)
    const group = groupsById.get(question.groupId)
    const children = (childrenByGroup.get(question.groupId) ?? []).toSorted((a, b) => (a.groupPosition ?? -1) - (b.groupPosition ?? -1))
    if (!group || !hasCompletePublishedGroup(children)) continue
    units.push({ id: group.id, group, questions: children })
  }
  return units
}

export type PracticeScore = { correctCount: number; totalQuestions: number; score: number; maximum: number }

export function scorePracticeUnits(units: PracticeUnit[], answers: Record<string, number>): PracticeScore {
  const questions = units.flatMap((unit) => unit.questions)
  const correctCount = questions.filter((question) => answers[question.id] === question.correctAnswerIndex).length
  const score = units.reduce((total, unit) => {
    if (unit.group) return total + (unit.questions.every((question) => answers[question.id] !== undefined && answers[question.id] === question.correctAnswerIndex) ? 2 : 0)
    const question = unit.questions[0]
    return total + (answers[question.id] === question.correctAnswerIndex ? 1 : 0)
  }, 0)
  return { correctCount, totalQuestions: questions.length, score, maximum: units.reduce((total, unit) => total + (unit.group ? 2 : 1), 0) }
}
