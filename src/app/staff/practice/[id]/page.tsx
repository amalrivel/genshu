import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { requireSensei } from "@/lib/staff"
import { database } from "@/lib/content-repository"
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
    const rows = await database()`
      select id, title as "titleJa", title_id as "titleId", description as "descriptionJa", description_id as "descriptionId",
        target_level as level, topic, is_published as published from practice_sets where id = ${id} limit 1
    `
    set = rows[0] as SetRow | undefined
    if (!set) notFound()
    const questionRows = await database()`
      select id, question_type as type, prompt, prompt_plain as "promptPlain", translation_id as "translationId", options,
        correct_answer_index as "correctAnswerIndex", explanation_ja as "explanationJa", explanation_id as "explanationId"
      from practice_questions where practice_set_id = ${id} order by position
    `
    questions = questionRows as unknown as PracticeQuestion[]
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
