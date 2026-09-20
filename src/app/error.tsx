"use client"

import { AlertTriangle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { PageShell } from "@/components/layout/page-frame"

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common")

  return (
    <PageShell>
      <div className="empty-state min-h-[60vh]">
        <div className="empty-state-icon text-destructive"><AlertTriangle className="size-5" /></div>
        <h1 className="text-lg font-semibold">{t("errorTitle")}</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{t("errorDesc")}</p>
        <Button className="mt-4" onClick={reset}>{t("retry")}</Button>
      </div>
    </PageShell>
  )
}

