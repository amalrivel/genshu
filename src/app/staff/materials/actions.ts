"use server"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { database } from "@/lib/content-repository"
import { requireSensei } from "@/lib/staff"
import type { StaffFormState } from "@/components/staff-action-form"

function field(form: FormData, name: string, max: number) {
  const value = String(form.get(name) ?? "").trim()
  if (!value || value.length > max) throw new Error("Isian materi tidak valid: " + name)
  return value
}

export async function saveMaterial(_state: StaffFormState, form: FormData): Promise<StaffFormState> {
  await requireSensei()
  let slug = ""
  try {
    slug = field(form, "slug", 80)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Slug materi tidak valid.")
    const titleJa = field(form, "titleJa", 200)
    const titleId = field(form, "titleId", 200)
    const summaryJa = field(form, "summaryJa", 500)
    const summaryId = field(form, "summaryId", 500)
    const level = field(form, "level", 2)
    if (!["N5", "N4", "N3"].includes(level)) throw new Error("Level tidak valid.")
    const topic = field(form, "topic", 100)
    const sectionCount = Number(form.get("sectionCount"))
    if (!Number.isInteger(sectionCount) || sectionCount < 1 || sectionCount > 20) throw new Error("Jumlah bagian materi tidak valid.")
    const sections = Array.from({ length: sectionCount }, (_, index) => ({
      headingJa: field(form, "headingJa" + index, 200),
      headingId: field(form, "headingId" + index, 200),
      bodyJa: field(form, "bodyJa" + index, 10000),
      bodyId: field(form, "bodyId" + index, 10000),
    }))
    const published = form.get("published") === "on"
    const original = String(form.get("original") ?? "")
    const db = database()
    if (original) {
      if (original !== slug) throw new Error("Slug materi tidak dapat diubah.")
      const rows = await db`
        update learning_materials set
          title_ja = ${titleJa}, title_id = ${titleId}, summary_ja = ${summaryJa}, summary_id = ${summaryId},
          level = ${level}, topic = ${topic}, sections = ${db.json(sections)}::jsonb,
          is_published = ${published}, published_at = case when ${published} then coalesce(published_at, now()) else null end,
          updated_at = now()
        where slug = ${slug} returning slug
      `
      if (rows.length !== 1) throw new Error("Materi tidak ditemukan.")
    } else {
      await db`
        insert into learning_materials
          (slug, title_ja, title_id, summary_ja, summary_id, level, topic, sections, is_published, published_at)
        values (${slug}, ${titleJa}, ${titleId}, ${summaryJa}, ${summaryId}, ${level}, ${topic},
          ${db.json(sections)}::jsonb, ${published}, case when ${published} then now() else null end)
      `
    }
  } catch {
    const t = await getTranslations("staff")
    return { error: t("saveError") }
  }
  revalidatePath("/materials")
  revalidatePath("/materials/" + slug)
  redirect("/staff/materials")
}
