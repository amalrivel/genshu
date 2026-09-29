import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { requireSensei } from "@/lib/staff"
import { createClient } from "@/lib/supabase/server"
import { StaffContentCatalog } from "@/components/staff-content-catalog"

export const dynamic = "force-dynamic"

export default async function StaffMaterialsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const staff = await requireSensei()
  const t = await getTranslations("staff")
  const client = await createClient()
  const { data: materials, error } = await client.from("learning_materials")
    .select("slug,title_ja,title_id,is_published,updated_at").order("updated_at", { ascending: false }).order("slug")
  if (error) throw new Error(`Supabase material list failed: ${error.message}`)
  const params = await searchParams
  const query = params.q ?? ""
  const status = ["published", "draft"].includes(params.status ?? "") ? params.status! : "all"
  return <main className="mx-auto w-full max-w-4xl px-5 py-12">
    <Link href="/staff" className="text-sm text-primary">← {t("backStaff")}</Link>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">{t("materialsTitle")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("signedInAs", { name: staff.displayName, role: t("sensei") })}. {t("draftNote")}</p></div><Link href="/staff/materials/new" className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-medium text-primary-foreground">{t("createMaterial")}</Link></div>
    <StaffContentCatalog query={query} status={status} items={(materials ?? []).map((material) => ({ id: material.slug, href: `/staff/materials/${material.slug}`, title: material.title_ja, secondaryTitle: material.title_id, published: material.is_published, updatedAt: material.updated_at }))} />
  </main>
}
