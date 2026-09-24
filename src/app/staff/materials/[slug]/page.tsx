import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { requireSensei } from "@/lib/staff"
import { database } from "@/lib/content-repository"
import { saveMaterial } from "../actions"
import { StaffActionForm } from "@/components/staff-action-form"
import { MaterialSectionsEditor } from "@/components/material-sections-editor"
import type { MaterialSection } from "@/lib/content-types"

export const dynamic = "force-dynamic"

type MaterialRow = { slug: string; titleJa: string; titleId: string; summaryJa: string; summaryId: string; level: string; topic: string; sections: MaterialSection[]; published: boolean }

export default async function MaterialEditor({ params }: { params: Promise<{ slug: string }> }) {
  await requireSensei()
  const t = await getTranslations("staff")
  const { slug } = await params
  let material: MaterialRow | undefined
  if (slug !== "new") {
    const rows = await database()`
      select slug, title_ja as "titleJa", title_id as "titleId", summary_ja as "summaryJa", summary_id as "summaryId",
        level, topic, sections, is_published as "published" from learning_materials where slug = ${slug} limit 1
    `
    material = rows[0] as unknown as MaterialRow | undefined
    if (!material) notFound()
  }
  const inputClass = "mt-1 w-full rounded-md border bg-background px-3 py-2"
  return <main className="mx-auto w-full max-w-3xl px-5 py-12">
    <Link href="/staff/materials" className="text-sm text-primary">← {t("backMaterials")}</Link>
    <h1 className="mt-6 text-2xl font-semibold">{t(material ? "editMaterial" : "createMaterial")}</h1>
    <p className="mt-2 text-sm text-muted-foreground">{t("materialDraftHint")}</p>
    <StaffActionForm action={saveMaterial} submitLabel={t("saveMaterial")}>
      <input type="hidden" name="original" value={material?.slug ?? ""} />
      <label className="block text-sm font-medium">{t("slug")}<input className={inputClass} name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" required maxLength={80} defaultValue={material?.slug} readOnly={!!material} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">{t("titleJa")}<input className={inputClass} name="titleJa" required maxLength={200} defaultValue={material?.titleJa} /></label>
        <label className="block text-sm font-medium">{t("titleId")}<input className={inputClass} name="titleId" required maxLength={200} defaultValue={material?.titleId} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">{t("summaryJa")}<textarea className={inputClass} name="summaryJa" required maxLength={500} rows={3} defaultValue={material?.summaryJa} /></label>
        <label className="block text-sm font-medium">{t("summaryId")}<textarea className={inputClass} name="summaryId" required maxLength={500} rows={3} defaultValue={material?.summaryId} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">{t("level")}<select name="level" className={inputClass} defaultValue={material?.level ?? "N5"}><option>N5</option><option>N4</option><option>N3</option></select></label>
        <label className="block text-sm font-medium">{t("topic")}<input className={inputClass} name="topic" required maxLength={100} defaultValue={material?.topic} /></label>
      </div>
      <MaterialSectionsEditor initial={material?.sections ?? []} />
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="published" defaultChecked={material?.published} />{t("publishMaterial")}</label>
    </StaffActionForm>
  </main>
}
