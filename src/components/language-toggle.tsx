"use client"

import * as React from "react"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const t = useTranslations("nav")

  const toggleLanguage = () => {
    const nextLocale = locale === "id" ? "ja" : "id"
    // Set persistent 1-year cookie
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`
    startTransition(() => {
      router.refresh()
    })
  }

  const isIndonesian = locale === "id"

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      disabled={isPending}
      title={t("toggleLang")}
      aria-label={t("toggleLang")}
      className="relative overflow-hidden group"
    >
      <Languages className="h-[1.05rem] w-[1.05rem] text-foreground/80 group-hover:text-foreground transition-colors" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[0.58rem] font-black uppercase px-1 rounded-tl bg-primary text-primary-foreground leading-tight tracking-tight shadow-xs">
        {isIndonesian ? "ID" : "JP"}
      </span>
      <span className="sr-only">Toggle language</span>
    </Button>
  )
}
