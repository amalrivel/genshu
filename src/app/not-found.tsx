import Link from "next/link"
import { SearchX } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { PageShell } from "@/components/layout/page-frame"

export default async function NotFound() {
  const t = await getTranslations("common")

  return (
    <PageShell>
      <div className="empty-state min-h-[60vh]">
        <div className="empty-state-icon"><SearchX className="size-5" /></div>
        <h1 className="text-lg font-semibold">{t("notFoundTitle")}</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{t("notFoundDesc")}</p>
        <Link href="/"><Button className="mt-4">{t("home")}</Button></Link>
      </div>
    </PageShell>
  )
}

