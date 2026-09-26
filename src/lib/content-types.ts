export type MaterialSection = {
  headingJa: string
  headingId: string
  bodyJa: string
  bodyId: string
}

export type PublishedMaterial = {
  slug: string
  titleJa: string
  titleId: string
  summaryJa: string
  summaryId: string
  level: string
  topic: string
  updatedAt: string
  sections: MaterialSection[]
}

export type PracticeQuestion = {
  id: string
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE"
  prompt: string
  promptPlain: string
  translationId: string
  options: string[]
  correctAnswerIndex: number
  explanationJa: string
  explanationId: string
  explanationMarkup: string
  context: string
  contextMarkup: string
  imageUrl: string
  imageWidth: number | null
  imageHeight: number | null
  isPublished: boolean
  sourceRef: string
  sourceDigest: string
}

export type PublishedPracticeSet = {
  id: string
  titleJa: string
  titleId: string
  descriptionJa: string
  descriptionId: string
  targetLevel: string
  topic: string
  publishedAt: string
  questions: PracticeQuestion[]
}

export type PublishedPracticeSummary = Omit<PublishedPracticeSet, "questions"> & {
  questionCount: number
}
