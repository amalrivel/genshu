"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, BookOpenCheck, Search } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import type { PublishedPracticeSummary } from "@/lib/content-types"

const TOPIC_KEYS: Partial<Record<PublishedPracticeSummary["topic"], "topicVocab" | "topicGrammar" | "topicCulture" | "topicKanji" | "topicBook" | "topicGenchare" | "topicMenkyoBlog">> = {
  語彙: "topicVocab",
  文法: "topicGrammar",
  "文化・マナー": "topicCulture",
  漢字: "topicKanji",
  book: "topicBook",
  genchare: "topicGenchare",
  menkyo_blog: "topicMenkyoBlog",
}

export function PracticeCatalog({ sets }: { sets: PublishedPracticeSummary[] }) {
  const t = useTranslations("practice")
  const locale = useLocale()
  const japanese = locale === "ja"
  const [query, setQuery] = React.useState("")
  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
  const filteredSets = sets.filter((set) =>
    `${set.titleJa} ${set.titleId} ${set.descriptionJa} ${set.descriptionId}`.toLocaleLowerCase(locale).includes(normalizedQuery),
  )

  return (
    <PageShell>
      <PageHeader
        eyebrow={<Badge variant="outline">{t("badge")}</Badge>}
        title={t("title")}
        description={t("desc")}
      />
      <p className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">
        {t("anonymousPracticeNote")}
      </p>
      <section aria-labelledby="practice-list-title" className="space-y-4">
        <SectionHeader title={<span id="practice-list-title">{t("listTitle")}</span>} description={t("resultsSummary", { shown: filteredSets.length, total: sets.length })} />
        <div className="relative w-full sm:max-w-md">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" aria-label={t("searchPlaceholder")} placeholder={t("searchPlaceholder")} value={query} onChange={(event) => setQuery(event.target.value)} className="bg-card pl-9" />
        </div>
        {filteredSets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <BookOpenCheck className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">{t("noSetsEmpty")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("noSetsEmptyDesc")}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSets.map((set) => (
              <li key={set.id} className="min-w-0">
                <Link href={`/practice/${set.id}`} aria-label={t("openPracticeFor", { title: japanese ? set.titleJa : set.titleId })} className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Card className="flex h-full flex-col border-border/80 transition-colors group-hover:border-primary/40 group-hover:shadow-md">
                    <CardHeader className="space-y-3 p-5 pb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-xs">{set.targetLevel === "NON_JLPT" ? t("levelNonJlpt") : set.targetLevel}</Badge>
                        <Badge variant="secondary" className="text-xs">{TOPIC_KEYS[set.topic] ? t(TOPIC_KEYS[set.topic]!) : set.topic}</Badge>
                      </div>
                      <div><CardTitle className="text-base transition-colors group-hover:text-primary sm:text-lg">{japanese ? set.titleJa : set.titleId}</CardTitle><CardDescription className="mt-2 line-clamp-3 text-sm">{japanese ? set.descriptionJa : set.descriptionId}</CardDescription></div>
                    </CardHeader>
                    <CardContent className="mt-auto flex items-center justify-between gap-3 p-5 pt-3">
                      <span className="text-sm text-muted-foreground">{t("questionCountValue", { count: set.questionCount })}</span>
                      <span className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary">{t("startPractice")}<ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                    </CardContent>
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

export default function PracticePage({ sets }: { sets: PublishedPracticeSummary[] }) {
  return <PracticeCatalog sets={sets} />
}
