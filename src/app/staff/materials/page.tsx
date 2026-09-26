import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { requireSensei } from "@/lib/staff"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function StaffMaterialsPage() {
  const staff = await requireSensei()
  const t = await getTranslations("staff")
  const client = await createClient()
  const { data: materials, error } = await client.from("learning_materials")
    .select("slug,title_id,is_published,updated_at").order("updated_at", { ascending: false }).order("slug")
  if (error) throw new Error(`Supabase material list failed: ${error.message}`)
  return <main className="mx-auto w-full max-w-4xl px-5 py-12">
    <Link href="/staff" className="text-sm text-primary">← {t("backStaff")}</Link>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">{t("materialsTitle")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("signedInAs", { name: staff.displayName, role: t("sensei") })}. {t("draftNote")}</p></div><Link href="/staff/materials/new" className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">{t("createMaterial")}</Link></div>
    <ul className="mt-8 divide-y rounded-lg border">
      {(materials ?? []).map((material) => <li key={material.slug} className="flex items-center justify-between gap-4 p-4"><div><p className="font-medium">{material.title_id}</p><p className="text-sm text-muted-foreground">{t(material.is_published ? "published" : "draft")} · {material.updated_at.slice(0, 10)}</p></div><Link href={"/staff/materials/" + material.slug} className="text-sm font-medium text-primary">{t("edit")}</Link></li>)}
    </ul>
  </main>
}
