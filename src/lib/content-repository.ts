import "server-only"
import postgres from "postgres"
import type { PublishedMaterial, PublishedPracticeSet, PublishedPracticeSummary } from "@/lib/content-types"

const globalForPostgres = globalThis as typeof globalThis & {
  genshuSql?: ReturnType<typeof postgres>
}

export function database() {
  const connectionString = process.env.POSTGRES_URL
  if (!connectionString) {
    throw new Error("POSTGRES_URL belum diatur. Salin contoh konfigurasi .env.example ke .env.local.")
  }

  const parsedUrl = new URL(connectionString)
  parsedUrl.searchParams.delete("schema")
  globalForPostgres.genshuSql ??= postgres(parsedUrl.toString(), {
    max: 2,
    idle_timeout: 20,
    connect_timeout: 5,
    prepare: false,
  })
  return globalForPostgres.genshuSql
}

export async function listPublishedMaterials(): Promise<PublishedMaterial[]> {
  const rows = await database()`
    select slug, title_ja as "titleJa", title_id as "titleId",
      summary_ja as "summaryJa", summary_id as "summaryId", level, topic,
      updated_at::date::text as "updatedAt", sections
    from learning_materials
    where is_published = true and published_at is not null
    order by sort_order asc, published_at desc, slug asc
  `
  return rows as unknown as PublishedMaterial[]
}

export async function getPublishedMaterial(slug: string): Promise<PublishedMaterial | null> {
  const rows = await database()`
    select slug, title_ja as "titleJa", title_id as "titleId",
      summary_ja as "summaryJa", summary_id as "summaryId", level, topic,
      updated_at::date::text as "updatedAt", sections
    from learning_materials
    where slug = ${slug} and is_published = true and published_at is not null
    limit 1
  `
  return (rows[0] as unknown as PublishedMaterial | undefined) ?? null
}

export async function listPublishedPracticeSets(): Promise<PublishedPracticeSummary[]> {
  const rows = await database()`
    select p.id, p.title as "titleJa", p.title_id as "titleId",
      p.description as "descriptionJa", p.description_id as "descriptionId", p.target_level as "targetLevel",
      p.topic, p.published_at::date::text as "publishedAt",
      count(q.id)::integer as "questionCount"
    from practice_sets p
    join practice_questions q on q.practice_set_id = p.id
    where p.is_published = true and p.published_at is not null
    group by p.id
    order by p.published_at desc, p.id asc
  `
  return rows as unknown as PublishedPracticeSummary[]
}

export async function getPublishedPracticeSet(id: string): Promise<PublishedPracticeSet | null> {
  const rows = await database()`
    select p.id, p.title as "titleJa", p.title_id as "titleId",
      p.description as "descriptionJa", p.description_id as "descriptionId", p.target_level as "targetLevel",
      p.topic, p.published_at::date::text as "publishedAt",
      coalesce(jsonb_agg(jsonb_build_object(
        'id', q.id,
        'type', q.question_type,
        'prompt', q.prompt,
        'promptPlain', q.prompt_plain,
        'translationId', q.translation_id,
        'options', q.options,
        'correctAnswerIndex', q.correct_answer_index,
        'explanationJa', q.explanation_ja,
        'explanationId', q.explanation_id
      ) order by q.position) filter (where q.id is not null), '[]'::jsonb) as questions
    from practice_sets p
    left join practice_questions q on q.practice_set_id = p.id
    where p.id = ${id} and p.is_published = true and p.published_at is not null
    group by p.id
    having count(q.id) > 0
    limit 1
  `
  return (rows[0] as unknown as PublishedPracticeSet | undefined) ?? null
}
