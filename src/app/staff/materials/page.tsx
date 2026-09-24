import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { requireSensei } from "@/lib/staff"
import { database } from "@/lib/content-repository"

export const dynamic = "force-dynamic"

export default async function StaffMaterialsPage() {
  const staff = await requireSensei()
  const t = await getTranslations("staff")
  const materials = await database()`
    select slug, title_id as "titleId", is_published as "published", updated_at::date::text as "updatedAt"
    from learning_materials order by updated_at desc, slug asc
  `
  return <main className="mx-auto w-full max-w-4xl px-5 py-12">
    <Link href="/staff" className="text-sm text-primary">← {t("backStaff")}</Link>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">{t("materialsTitle")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("signedInAs", { name: staff.displayName, role: t("sensei") })}. {t("draftNote")}</p></div><Link href="/staff/materials/new" className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">{t("createMaterial")}</Link></div>
    <ul className="mt-8 divide-y rounded-lg border">
      {materials.map((material) => <li key={material.slug} className="flex items-center justify-between gap-4 p-4"><div><p className="font-medium">{material.titleId}</p><p className="text-sm text-muted-foreground">{t(material.published ? "published" : "draft")} · {material.updatedAt}</p></div><Link href={"/staff/materials/" + material.slug} className="text-sm font-medium text-primary">{t("edit")}</Link></li>)}
    </ul>
  </main>
}
