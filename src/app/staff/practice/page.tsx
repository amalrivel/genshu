import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { requireSensei } from "@/lib/staff"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function StaffPracticePage() {
  await requireSensei()
  const t = await getTranslations("staff")
  const client = await createClient()
  const { data: sets, error } = await client.from("practice_sets")
    .select("id,title_id,is_published,updated_at").order("updated_at", { ascending: false }).order("id")
  if (error) throw new Error(`Supabase practice list failed: ${error.message}`)
  return <main className="mx-auto w-full max-w-4xl px-5 py-12">
    <Link href="/staff" className="text-sm text-primary">← {t("backStaff")}</Link>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">{t("practiceTitle")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("draftNote")}</p></div><Link href="/staff/practice/new" className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">{t("createPractice")}</Link></div>
    <ul className="mt-8 divide-y rounded-lg border">
      {(sets ?? []).map((set) => <li key={set.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-medium">{set.title_id}</p><p className="text-sm text-muted-foreground">{t(set.is_published ? "published" : "draft")} · {set.updated_at.slice(0, 10)}</p></div><Link href={"/staff/practice/" + set.id} className="text-sm font-medium text-primary">{t("edit")}</Link></li>)}
    </ul>
  </main>
}
