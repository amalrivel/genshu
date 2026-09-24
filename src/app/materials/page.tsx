import Link from "next/link"
import { ArrowRight, BookOpenText } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { listPublishedMaterials } from "@/lib/content-repository"

export const dynamic = "force-dynamic"

export default async function MaterialsPage() {
  const [materials, locale, t] = await Promise.all([
    listPublishedMaterials(),
    getLocale(),
    getTranslations("materials"),
  ])
  const japanese = locale === "ja"

  return (
    <PageShell>
      <PageHeader eyebrow={<Badge variant="outline">{t("badge")}</Badge>} title={t("title")} description={t("description")} />
      <section className="space-y-4" aria-labelledby="materials-list-title">
        <SectionHeader title={<span id="materials-list-title">{t("listTitle")}</span>} description={t("publishedNote")} />
        {materials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <BookOpenText className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">{t("emptyTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {materials.map((material) => (
              <li key={material.slug} className="min-w-0">
                <Link href={`/materials/${material.slug}`} className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Card className="flex h-full flex-col border-border/80 transition-colors group-hover:border-primary/40 group-hover:shadow-md">
                    <CardHeader className="space-y-3 p-5 pb-3">
                      <div className="flex items-center gap-2"><Badge variant="outline" className="font-mono text-xs">{material.level}</Badge><Badge variant="secondary" className="text-xs">{material.topic}</Badge></div>
                      <div><CardTitle className="text-lg transition-colors group-hover:text-primary">{japanese ? material.titleJa : material.titleId}</CardTitle><CardDescription className="mt-2 text-sm leading-6">{japanese ? material.summaryJa : material.summaryId}</CardDescription></div>
                    </CardHeader>
                    <CardContent className="mt-auto flex items-center justify-between p-5 pt-3"><time dateTime={material.updatedAt} className="text-xs text-muted-foreground">{t("updated", { date: material.updatedAt })}</time><span className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary">{t("readMaterial")}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span></CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  )
}
