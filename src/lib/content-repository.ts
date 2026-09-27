import "server-only"
import { createClient } from "@/lib/supabase/server"
import { buildPracticeUnits, countPublishedPracticeQuestions } from "@/lib/practice-units"
import type { PublishedMaterial, PublishedPracticeSet, PublishedPracticeSummary } from "@/lib/content-types"

function checkError(context: string, error: { message: string } | null) {
  if (error) throw new Error(`Supabase ${context} failed: ${error.message}`)
}

export async function listPublishedMaterials(): Promise<PublishedMaterial[]> {
  const client = await createClient()
  const { data, error } = await client
    .from("learning_materials")
    .select("slug,title_ja,title_id,summary_ja,summary_id,level,topic,updated_at,sections")
    .eq("is_published", true)
    .not("published_at", "is", null)
    .order("sort_order")
    .order("published_at", { ascending: false })
    .order("slug")
  checkError("material list", error)
  return (data ?? []).map((row) => ({
    slug: row.slug,
    titleJa: row.title_ja,
    titleId: row.title_id,
    summaryJa: row.summary_ja,
    summaryId: row.summary_id,
    level: row.level,
    topic: row.topic,
    updatedAt: row.updated_at.slice(0, 10),
    sections: row.sections as unknown as PublishedMaterial["sections"],
  }))
}

export async function getPublishedMaterial(slug: string): Promise<PublishedMaterial | null> {
  const client = await createClient()
  const { data, error } = await client
    .from("learning_materials")
    .select("slug,title_ja,title_id,summary_ja,summary_id,level,topic,updated_at,sections")
    .eq("slug", slug)
    .eq("is_published", true)
    .not("published_at", "is", null)
    .maybeSingle()
  checkError("material lookup", error)
  if (!data) return null
  return {
    slug: data.slug,
    titleJa: data.title_ja,
    titleId: data.title_id,
    summaryJa: data.summary_ja,
    summaryId: data.summary_id,
    level: data.level,
    topic: data.topic,
    updatedAt: data.updated_at.slice(0, 10),
    sections: data.sections as unknown as PublishedMaterial["sections"],
  }
}

export async function listPublishedPracticeSets(): Promise<PublishedPracticeSummary[]> {
  const client = await createClient()
  const { data, error } = await client
    .from("practice_sets")
    .select("id,title,title_id,description,description_id,target_level,topic,published_at")
    .eq("is_published", true)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .order("id")
  checkError("practice list", error)
  if (!data?.length) return []

  const { data: questions, error: questionError } = await client
    .from("practice_questions")
    .select("practice_set_id,question_group_id,group_position,is_published")
    .eq("is_published", true)
    .in("practice_set_id", data.map(({ id }) => id))
  checkError("practice question counts", questionError)
  const { data: groups, error: groupError } = await client.from("practice_question_groups")
    .select("id,practice_set_id")
    .in("practice_set_id", data.map(({ id }) => id))
  checkError("practice group counts", groupError)
  const counts = countPublishedPracticeQuestions((questions ?? []).map((question) => ({
    practiceSetId: question.practice_set_id, groupId: question.question_group_id,
    groupPosition: question.group_position, isPublished: question.is_published,
  })), (groups ?? []).map((group) => ({ id: group.id, practiceSetId: group.practice_set_id })))

  return data.flatMap((row) => {
    const questionCount = counts.get(row.id) ?? 0
    return questionCount === 0 ? [] : [{
      id: row.id,
      titleJa: row.title,
      titleId: row.title_id,
      descriptionJa: row.description,
      descriptionId: row.description_id,
      targetLevel: row.target_level as PublishedPracticeSummary["targetLevel"],
      topic: row.topic as PublishedPracticeSummary["topic"],
      publishedAt: row.published_at!.slice(0, 10),
      questionCount,
    }]
  })
}

export async function getPublishedPracticeSet(id: string): Promise<PublishedPracticeSet | null> {
  const client = await createClient()
  const { data: row, error } = await client
    .from("practice_sets")
    .select("id,title,title_id,description,description_id,target_level,topic,published_at")
    .eq("id", id)
    .eq("is_published", true)
    .not("published_at", "is", null)
    .maybeSingle()
  checkError("practice lookup", error)
  if (!row) return null

  const { data: rows, error: questionError } = await client
    .from("practice_questions")
    .select("id,question_type,prompt,prompt_plain,translation_id,options,correct_answer_index,explanation_ja,explanation_id,explanation_markup,question_context,question_context_markup,image_url,image_width,image_height,is_published,source_ref,source_digest,question_group_id,group_position")
    .eq("practice_set_id", id)
    .eq("is_published", true)
    .order("position")
  checkError("practice questions", questionError)
  if (!rows?.length) return null
  const { data: groups, error: groupError } = await client.from("practice_question_groups")
    .select("id,question_context,question_context_markup,image_url,image_width,image_height")
    .eq("practice_set_id", id).order("position")
  checkError("practice question groups", groupError)

  const publishedQuestions = (rows ?? []).map((question) => ({
    id: question.id,
    type: question.question_type as PublishedPracticeSet["questions"][number]["type"],
    prompt: question.prompt,
    promptPlain: question.prompt_plain,
    translationId: question.translation_id,
    options: question.options as unknown as string[],
    correctAnswerIndex: question.correct_answer_index,
    explanationJa: question.explanation_ja,
    explanationId: question.explanation_id,
    explanationMarkup: question.explanation_markup,
    context: question.question_context,
    contextMarkup: question.question_context_markup,
    imageUrl: question.image_url,
    imageWidth: question.image_width,
    imageHeight: question.image_height,
    isPublished: question.is_published,
    sourceRef: question.source_ref ?? "",
    sourceDigest: question.source_digest ?? "",
    groupId: question.question_group_id,
    groupPosition: question.group_position,
  }))
  const questionGroups = (groups ?? []).map((group) => ({
    id: group.id, context: group.question_context, contextMarkup: group.question_context_markup,
    imageUrl: group.image_url, imageWidth: group.image_width, imageHeight: group.image_height,
  }))
  const units = buildPracticeUnits(publishedQuestions, questionGroups)
  if (units.length === 0) return null
  const playableGroupIds = new Set(units.filter((unit) => unit.group).map((unit) => unit.id))

  return {
    id: row.id,
    titleJa: row.title,
    titleId: row.title_id,
    descriptionJa: row.description,
    descriptionId: row.description_id,
    targetLevel: row.target_level as PublishedPracticeSet["targetLevel"],
    topic: row.topic as PublishedPracticeSet["topic"],
    publishedAt: row.published_at!.slice(0, 10),
    questions: units.flatMap((unit) => unit.questions),
    questionGroups: questionGroups.filter((group) => playableGroupIds.has(group.id)),
  }
}
