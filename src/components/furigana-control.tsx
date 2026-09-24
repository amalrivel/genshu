"use client"

import * as React from "react"
import { Eye, EyeOff, Languages } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FuriganaTokenText } from "@/components/ui/furigana-token-text"
import type { MaterialSection } from "@/lib/content-types"

export function FuriganaControl({ sections, japanese, labels }: {
  sections: MaterialSection[]
  japanese: boolean
  labels: { show: string; hide: string; showTranslation: string; hideTranslation: string; translation: string; updated: string }
}) {
  const [showFurigana, setShowFurigana] = React.useState(true)
  const [showTranslation, setShowTranslation] = React.useState(false)
  const t = useTranslations("materials")

  return (
    <article className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 border-y border-border/60 py-3">
        <Button type="button" variant={showFurigana ? "secondary" : "outline"} size="sm" aria-pressed={showFurigana} onClick={() => setShowFurigana((shown) => !shown)} className="min-h-11 gap-2">
          {showFurigana ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}{showFurigana ? labels.hide : labels.show}
        </Button>
        <Button type="button" variant={showTranslation ? "secondary" : "outline"} size="sm" aria-pressed={showTranslation} onClick={() => setShowTranslation((shown) => !shown)} className="min-h-11 gap-2">
          <Languages className="size-4" aria-hidden="true" />{showTranslation ? labels.hideTranslation : labels.showTranslation}
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">{labels.updated}</span>
      </div>
      {sections.map((section, index) => (
        <Card key={`${section.headingJa}-${index}`} className="border-border/80">
          <CardContent className="space-y-4 p-5 sm:p-7">
            <h2 className="text-xl font-semibold tracking-tight">{japanese ? section.headingJa : section.headingId}</h2>
            <p className="text-base leading-8 text-foreground sm:text-lg"><FuriganaTokenText text={section.bodyJa} showFurigana={showFurigana} /></p>
            {showTranslation && <div className="rounded-lg border border-border/60 bg-muted/40 p-4 text-sm leading-7 text-muted-foreground"><p className="mb-1 text-xs font-semibold uppercase tracking-wide">{labels.translation}</p>{section.bodyId}</div>}
            {!japanese && <p className="text-xs text-muted-foreground">{t("japaneseOriginal")}</p>}
          </CardContent>
        </Card>
      ))}
    </article>
  )
}
