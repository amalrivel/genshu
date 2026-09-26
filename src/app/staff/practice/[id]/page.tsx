import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { requireSensei } from "@/lib/staff"
import { createClient } from "@/lib/supabase/server"
import { PracticeQuestionsEditor } from "@/components/practice-questions-editor"
import { savePracticeSet } from "../actions"
import { StaffActionForm } from "@/components/staff-action-form"
import type { PracticeQuestion } from "@/lib/content-types"

export const dynamic = "force-dynamic"

type SetRow = { id: string; titleJa: string; titleId: string; descriptionJa: string; descriptionId: string; level: string; topic: string; published: boolean }

export default async function PracticeEditor({ params }: { params: Promise<{ id: string }> }) {
  await requireSensei()
  const t = await getTranslations("staff")
  const { id } = await params
  let set: SetRow | undefined
  let questions: PracticeQuestion[] = []
  if (id !== "new") {
    const client = await createClient()
    const { data, error } = await client.from("practice_sets")
      .select("id,title,title_id,description,description_id,target_level,topic,is_published")
      .eq("id", id).maybeSingle()
    if (error) throw new Error(`Supabase practice lookup failed: ${error.message}`)
    set = data ? {
      id: data.id, titleJa: data.title, titleId: data.title_id,
      descriptionJa: data.description, descriptionId: data.description_id,
      level: data.target_level, topic: data.topic, published: data.is_published,
    } : undefined
    if (!set) notFound()
    const { data: questionRows, error: questionError } = await client.from("practice_questions")
      .select("id,question_type,prompt,prompt_plain,translation_id,options,correct_answer_index,explanation_ja,explanation_id")
      .eq("practice_set_id", id).order("position")
    if (questionError) throw new Error(`Supabase practice question lookup failed: ${questionError.message}`)
    questions = (questionRows ?? []).map((question) => ({
      id: question.id, type: question.question_type as PracticeQuestion["type"], prompt: question.prompt,
      promptPlain: question.prompt_plain, translationId: question.translation_id,
      options: question.options as unknown as string[], correctAnswerIndex: question.correct_answer_index,
      explanationJa: question.explanation_ja, explanationId: question.explanation_id,
    }))
  }
  const inputClass = "mt-1 w-full rounded-md border bg-background px-3 py-2"
  return <main className="mx-auto w-full max-w-3xl px-5 py-12">
    <Link href="/staff/practice" className="text-sm text-primary">← {t("backPractice")}</Link>
    <h1 className="mt-6 text-2xl font-semibold">{t(set ? "editPractice" : "createPractice")}</h1>
    <StaffActionForm action={savePracticeSet} submitLabel={t("savePractice")}>
      <input type="hidden" name="original" value={set?.id ?? ""} />
      <label className="block text-sm font-medium">{t("setId")}<input className={inputClass} name="id" pattern="[a-z0-9]+(-[a-z0-9]+)*" required maxLength={80} defaultValue={set?.id} readOnly={!!set} /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">{t("titleJa")}<input className={inputClass} name="titleJa" required maxLength={200} defaultValue={set?.titleJa} /></label><label className="block text-sm font-medium">{t("titleId")}<input className={inputClass} name="titleId" required maxLength={200} defaultValue={set?.titleId} /></label></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">{t("descriptionJa")}<textarea className={inputClass} name="descriptionJa" required maxLength={500} rows={3} defaultValue={set?.descriptionJa} /></label><label className="block text-sm font-medium">{t("descriptionId")}<textarea className={inputClass} name="descriptionId" required maxLength={500} rows={3} defaultValue={set?.descriptionId} /></label></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">{t("level")}<select name="level" className={inputClass} defaultValue={set?.level ?? "N5"}><option>N5</option><option>N4</option><option>N3</option></select></label><label className="block text-sm font-medium">{t("topic")}<select name="topic" className={inputClass} defaultValue={set?.topic ?? "語彙"}><option>語彙</option><option>文法</option><option>文化・マナー</option><option>漢字</option></select></label></div>
      <PracticeQuestionsEditor initial={questions} />
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="published" defaultChecked={set?.published} />{t("publishPractice")}</label>
    </StaffActionForm>
  </main>
}
