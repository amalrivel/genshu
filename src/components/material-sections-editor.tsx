"use client"
import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import type { MaterialSection } from "@/lib/content-types"

const blank = (): MaterialSection => ({ headingJa: "", headingId: "", bodyJa: "", bodyId: "" })

export function MaterialSectionsEditor({ initial }: { initial: MaterialSection[] }) {
  const t = useTranslations("staff")
  const nextKey = useRef(Math.max(initial.length, 1))
  const [sections, setSections] = useState<(MaterialSection & { key: number })[]>(
    (initial.length ? initial : [blank()]).map((section, index) => ({ ...section, key: index })),
  )
  const inputClass = "mt-1 w-full rounded-md border bg-background px-3 py-2"
  return <div className="space-y-5">
    <input type="hidden" name="sectionCount" value={sections.length} />
    {sections.map((section, index) => <fieldset key={section.key} className="space-y-4 rounded-lg border p-5"><legend className="px-2 font-semibold">{t("section", { number: index + 1 })}</legend>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">{t("headingJa")}<input className={inputClass} name={"headingJa" + index} required maxLength={200} defaultValue={section.headingJa} /></label><label className="block text-sm font-medium">{t("headingId")}<input className={inputClass} name={"headingId" + index} required maxLength={200} defaultValue={section.headingId} /></label></div>
      <label className="block text-sm font-medium">{t("bodyJa")}<textarea className={inputClass} name={"bodyJa" + index} required maxLength={10000} rows={7} defaultValue={section.bodyJa} /></label>
      <label className="block text-sm font-medium">{t("bodyId")}<textarea className={inputClass} name={"bodyId" + index} required maxLength={10000} rows={7} defaultValue={section.bodyId} /></label>
      {sections.length > 1 && <button type="button" onClick={() => setSections((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="text-sm text-destructive">{t("removeSection")}</button>}
    </fieldset>)}
    <button type="button" disabled={sections.length >= 20} onClick={() => setSections((items) => [...items, { ...blank(), key: nextKey.current++ }])} className="rounded-md border px-4 py-2 text-sm">{t("addSection")}</button>
  </div>
}
