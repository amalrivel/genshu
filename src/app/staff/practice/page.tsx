import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { requireSensei } from "@/lib/staff"
import { createClient } from "@/lib/supabase/server"
import { StaffContentCatalog } from "@/components/staff-content-catalog"

export const dynamic = "force-dynamic"

export default async function StaffPracticePage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireSensei()
  const t = await getTranslations("staff")
  const client = await createClient()
  const { data: sets, error } = await client.from("practice_sets")
    .select("id,title,title_id,is_published,updated_at").order("updated_at", { ascending: false }).order("id")
  if (error) throw new Error(`Supabase practice list failed: ${error.message}`)
  const params = await searchParams
  const query = params.q ?? ""
  const status = ["published", "draft"].includes(params.status ?? "") ? params.status! : "all"
  return <main className="mx-auto w-full max-w-4xl px-5 py-12">
    <Link href="/staff" className="text-sm text-primary">← {t("backStaff")}</Link>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">{t("practiceTitle")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("draftNote")}</p></div><Link href="/staff/practice/new" className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-medium text-primary-foreground">{t("createPractice")}</Link></div>
    <StaffContentCatalog query={query} status={status} items={(sets ?? []).map((set) => ({ id: set.id, href: `/staff/practice/${set.id}`, title: set.title, secondaryTitle: set.title_id, published: set.is_published, updatedAt: set.updated_at }))} />
  </main>
}
