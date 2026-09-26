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

function contentField(form: FormData, name: string, max: number, allowEmpty = false) {
  const value = String(form.get(name) ?? "")
  if ((!allowEmpty && !value.trim()) || value.length > max) throw new Error("Isian latihan tidak valid: " + name)
  return value
}

function optionalDimension(value: FormDataEntryValue | null) {
  if (value === null || value === "") return null
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1 || n > 4096) throw new Error("Ukuran aset tidak valid.")
  return n
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
    const descriptionJa = contentField(form, "descriptionJa", 500, true)
    const descriptionId = contentField(form, "descriptionId", 500, true)
    const level = field(form, "level", 2)
    const topic = field(form, "topic", 50)
    if (!["N5", "N4", "N3", "NON_JLPT"].includes(level) || !["語彙", "文法", "文化・マナー", "漢字", "book", "genchare", "menkyo_blog"].includes(topic)) throw new Error("Level atau topik tidak valid.")
    const client = await createClient()
    let maxQuestions = 30
    if (original) {
      const { data: stored, error: storedError } = await client.from("practice_sets").select("source_repository").eq("id", id).maybeSingle()
      if (storedError) throw storedError
      if (stored?.source_repository === "amalrivel/gentsuki-ready-web") maxQuestions = 60
    }
    const count = Number(form.get("questionCount"))
    if (!Number.isInteger(count) || count < 1 || count > maxQuestions) throw new Error("Jumlah soal tidak valid.")
    const questions = Array.from({ length: count }, (_, index) => {
      const type = field(form, "type" + index, 30)
      if (type !== "MULTIPLE_CHOICE" && type !== "TRUE_FALSE") throw new Error("Jenis soal tidak valid.")
      const options = type === "TRUE_FALSE" ? ["○", "×"] : [0, 1, 2, 3].map((n) => field(form, "option" + index + "_" + n, 500))
      const correct = Number(form.get("correct" + index))
      if (!Number.isInteger(correct) || correct < 0 || correct >= options.length) throw new Error("Jawaban benar tidak valid.")
      const imageUrl = contentField(form, "imageUrl" + index, 128, true)
      if (imageUrl && !/^\/gentsuki-quiz-assets\/[a-f0-9]{40}\.jpg$/.test(imageUrl)) throw new Error("Aset soal tidak valid.")
      return {
        id: contentField(form, "id" + index, 120, true),
        sourceRef: contentField(form, "sourceRef" + index, 120, true),
        sourceDigest: contentField(form, "sourceDigest" + index, 80, true),
        type, prompt: contentField(form, "prompt" + index, 2000),
        promptPlain: contentField(form, "promptPlain" + index, 2000, true),
        translationId: contentField(form, "translationId" + index, 2000, true),
        options, correct, explanationJa: contentField(form, "explanationJa" + index, 2000),
        explanationMarkup: contentField(form, "explanationMarkup" + index, 2000, true),
        context: contentField(form, "context" + index, 2000, true),
        contextMarkup: contentField(form, "contextMarkup" + index, 2000, true),
        imageUrl, imageWidth: optionalDimension(form.get("imageWidth" + index)),
        imageHeight: optionalDimension(form.get("imageHeight" + index)),
        isPublished: form.get("isPublished" + index) === "on",
        explanationId: contentField(form, "explanationId" + index, 2000, true),
      }
    })
    const published = form.get("published") === "on"
    const { error } = await client.rpc("save_practice_set", {
      p_set: {
        id, title: titleJa, title_id: titleId, description: descriptionJa,
        description_id: descriptionId, target_level: level, topic, is_published: published,
      },
      p_questions: questions.map((question) => ({
        question_type: question.type,
        id: question.id || null,
        prompt: question.prompt,
        prompt_plain: question.promptPlain || question.prompt.replace(/\{([^|{}]+)\|[^{}]+\}/g, "$1"),
        translation_id: question.translationId,
        options: question.options,
        correct_answer_index: question.correct,
        explanation_ja: question.explanationJa,
        explanation_id: question.explanationId,
        is_published: question.isPublished,
        explanation_markup: question.explanationMarkup || question.explanationJa,
        question_context: question.context,
        question_context_markup: question.contextMarkup,
        image_url: question.imageUrl,
        image_width: question.imageWidth,
        image_height: question.imageHeight,
        source_ref: question.sourceRef || null,
        source_digest: question.sourceDigest || null,
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
