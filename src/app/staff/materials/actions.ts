"use server"
import { revalidatePath } from "next/cache"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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
    const client = await createClient()
    const values = {
      title_ja: titleJa, title_id: titleId, summary_ja: summaryJa, summary_id: summaryId,
      level, topic, sections, is_published: published,
    }
    if (original) {
      if (original !== slug) throw new Error("Slug materi tidak dapat diubah.")
      const { data: current, error: lookupError } = await client.from("learning_materials")
        .select("published_at").eq("slug", slug).maybeSingle()
      if (lookupError) throw lookupError
      if (!current) throw new Error("Materi tidak ditemukan.")
      const now = new Date().toISOString()
      const { data, error } = await client.from("learning_materials").update({
        ...values,
        published_at: published ? current.published_at ?? now : null,
        updated_at: now,
      }).eq("slug", slug).select("slug").maybeSingle()
      if (error) throw error
      if (!data) throw new Error("Materi tidak ditemukan.")
    } else {
      const { error } = await client.from("learning_materials").insert({
        slug, ...values, published_at: published ? new Date().toISOString() : null,
      })
      if (error) throw error
    }
  } catch {
    const t = await getTranslations("staff")
    return { error: t("saveError") }
  }
  revalidatePath("/materials")
  revalidatePath("/materials/" + slug)
  redirect("/staff/materials")
}
