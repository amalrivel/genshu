import "server-only"
import { createClient } from "@/lib/supabase/server"
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
    .select("practice_set_id")
    .eq("is_published", true)
    .in("practice_set_id", data.map(({ id }) => id))
  checkError("practice question counts", questionError)
  const counts = new Map<string, number>()
  for (const question of questions ?? []) {
    counts.set(question.practice_set_id, (counts.get(question.practice_set_id) ?? 0) + 1)
  }

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
    .select("id,question_type,prompt,prompt_plain,translation_id,options,correct_answer_index,explanation_ja,explanation_id,explanation_markup,question_context,question_context_markup,image_url,image_width,image_height,is_published,source_ref,source_digest")
    .eq("practice_set_id", id)
    .eq("is_published", true)
    .order("position")
  checkError("practice questions", questionError)
  if (!rows?.length) return null

  return {
    id: row.id,
    titleJa: row.title,
    titleId: row.title_id,
    descriptionJa: row.description,
    descriptionId: row.description_id,
    targetLevel: row.target_level as PublishedPracticeSet["targetLevel"],
    topic: row.topic as PublishedPracticeSet["topic"],
    publishedAt: row.published_at!.slice(0, 10),
    questions: rows.map((question) => ({
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
    })),
  }
}
