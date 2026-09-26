"use server"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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
    const client = await createClient()
    const { error } = await client.rpc("save_practice_set", {
      p_set: {
        id, title: titleJa, title_id: titleId, description: descriptionJa,
        description_id: descriptionId, target_level: level, topic, is_published: published,
      },
      p_questions: questions.map((question) => ({
        question_type: question.type,
        prompt: question.prompt,
        prompt_plain: question.prompt.replace(/\{([^|{}]+)\|[^{}]+\}/g, "$1"),
        translation_id: question.translationId,
        options: question.options,
        correct_answer_index: question.correct,
        explanation_ja: question.explanationJa,
        explanation_id: question.explanationId,
      })),
      p_update: Boolean(original),
    })
    if (error) throw error
  } catch {
    const t = await getTranslations("staff")
    return { error: t("saveError") }
  }
  revalidatePath("/practice")
  revalidatePath("/practice/" + id)
  redirect("/staff/practice")
}
