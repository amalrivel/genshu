import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { Badge } from "@/components/ui/badge"
import { PageHeader, PageShell } from "@/components/layout/page-frame"
import { FuriganaControl } from "@/components/furigana-control"
import { getPublishedMaterial } from "@/lib/content-repository"

export const dynamic = "force-dynamic"

export default async function MaterialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [material, locale, t] = await Promise.all([
    getPublishedMaterial(slug),
    getLocale(),
    getTranslations("materials"),
  ])
  if (!material) notFound()
  const japanese = locale === "ja"

  return (
    <PageShell className="max-w-4xl">
      <Link href="/materials" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" aria-hidden="true" />{t("backToMaterials")}</Link>
      <PageHeader
        eyebrow={<span className="flex items-center gap-2"><Badge variant="outline" className="font-mono">{material.level}</Badge><Badge variant="secondary">{material.topic}</Badge></span>}
        title={japanese ? material.titleJa : material.titleId}
        description={japanese ? material.summaryJa : material.summaryId}
      />
      <FuriganaControl sections={material.sections} japanese={japanese} labels={{ show: t("showFurigana"), hide: t("hideFurigana"), showTranslation: t("showTranslation"), hideTranslation: t("hideTranslation"), translation: t("translation"), updated: t("updated", { date: material.updatedAt }) }} />
    </PageShell>
  )
}
