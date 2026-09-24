"use server"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { database } from "@/lib/content-repository"
import { requireSensei } from "@/lib/staff"
import type { StaffFormState } from "@/components/staff-action-form"

function field(form: FormData, name: string, max: number) {
  const value = String(form.get(name) ?? "").trim()
  if (!value || value.length > max) throw new Error("Isian latihan tidak valid: " + name)
  return value
}

export async function savePracticeSet(_state: StaffFormState, form: FormData): Promise<StaffFormState> {
  await requireSensei()
  let id = ""
  try {
    id = field(form, "id", 80)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error("ID latihan tidak valid.")
    const original = String(form.get("original") ?? "")
    if (original && original !== id) throw new Error("ID latihan tidak dapat diubah.")
    const titleJa = field(form, "titleJa", 200)
    const titleId = field(form, "titleId", 200)
    const descriptionJa = field(form, "descriptionJa", 500)
    const descriptionId = field(form, "descriptionId", 500)
    const level = field(form, "level", 2)
    const topic = field(form, "topic", 50)
    if (!["N5", "N4", "N3"].includes(level) || !["語彙", "文法", "文化・マナー", "漢字"].includes(topic)) throw new Error("Level atau topik tidak valid.")
    const count = Number(form.get("questionCount"))
    if (!Number.isInteger(count) || count < 1 || count > 30) throw new Error("Jumlah soal tidak valid.")
    const questions = Array.from({ length: count }, (_, index) => {
      const type = field(form, "type" + index, 30)
      if (type !== "MULTIPLE_CHOICE" && type !== "TRUE_FALSE") throw new Error("Jenis soal tidak valid.")
      const options = type === "TRUE_FALSE" ? ["○", "×"] : [0, 1, 2, 3].map((n) => field(form, "option" + index + "_" + n, 500))
      const correct = Number(form.get("correct" + index))
      if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) throw new Error("Jawaban benar tidak valid.")
      return {
        type, prompt: field(form, "prompt" + index, 2000),
        translationId: field(form, "translationId" + index, 2000),
        options, correct, explanationJa: field(form, "explanationJa" + index, 2000),
        explanationId: field(form, "explanationId" + index, 2000),
      }
    })
    const published = form.get("published") === "on"
    const db = database()
    await db.begin(async (sql) => {
      if (original) {
        const updated = await sql`
          update practice_sets set title = ${titleJa}, title_id = ${titleId}, description = ${descriptionJa},
            description_id = ${descriptionId}, target_level = ${level}, topic = ${topic},
            is_published = ${published}, published_at = case when ${published} then coalesce(published_at, now()) else null end,
            updated_at = now() where id = ${id} returning id
        `
        if (!updated.length) throw new Error("Latihan tidak ditemukan.")
        await sql`delete from practice_questions where practice_set_id = ${id}`
      } else {
        await sql`
          insert into practice_sets (id, title, title_id, description, description_id, target_level, topic, is_published, published_at)
          values (${id}, ${titleJa}, ${titleId}, ${descriptionJa}, ${descriptionId}, ${level}, ${topic}, ${published}, case when ${published} then now() else null end)
        `
      }
      for (const [position, question] of questions.entries()) {
        const questionId = id + "-q" + (position + 1)
        await sql`
          insert into practice_questions
            (id, practice_set_id, position, question_type, prompt, prompt_plain, translation_id, options, correct_answer_index, explanation_ja, explanation_id)
          values (${questionId}, ${id}, ${position}, ${question.type}, ${question.prompt},
            ${question.prompt.replace(/\{([^|{}]+)\|[^{}]+\}/g, "$1")}, ${question.translationId},
            ${JSON.stringify(question.options)}::jsonb, ${question.correct}, ${question.explanationJa}, ${question.explanationId})
        `
      }
    })
  } catch {
    const t = await getTranslations("staff")
    return { error: t("saveError") }
  }
  revalidatePath("/practice")
  revalidatePath("/practice/" + id)
  redirect("/staff/practice")
}
