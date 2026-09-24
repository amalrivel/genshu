import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { requireSensei } from "@/lib/staff"
import { database } from "@/lib/content-repository"

export const dynamic = "force-dynamic"

export default async function StaffPracticePage() {
  await requireSensei()
  const t = await getTranslations("staff")
  const sets = await database()`
    select id, title_id as "titleId", is_published as "published", updated_at::date::text as "updatedAt"
    from practice_sets order by updated_at desc, id asc
  `
  return <main className="mx-auto w-full max-w-4xl px-5 py-12">
    <Link href="/staff" className="text-sm text-primary">← {t("backStaff")}</Link>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">{t("practiceTitle")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("draftNote")}</p></div><Link href="/staff/practice/new" className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">{t("createPractice")}</Link></div>
    <ul className="mt-8 divide-y rounded-lg border">
      {sets.map((set) => <li key={set.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-medium">{set.titleId}</p><p className="text-sm text-muted-foreground">{t(set.published ? "published" : "draft")} · {set.updatedAt}</p></div><Link href={"/staff/practice/" + set.id} className="text-sm font-medium text-primary">{t("edit")}</Link></li>)}
    </ul>
  </main>
}
