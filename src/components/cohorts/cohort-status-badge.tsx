import { Archive, CheckCircle2, Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import type { CohortStatus } from "@/lib/mock-data"

interface CohortStatusBadgeProps {
  status: CohortStatus
  className?: string
}

export function CohortStatusBadge({ status, className }: CohortStatusBadgeProps) {
  const t = useTranslations("cohorts")

  if (status === "active") {
    return (
      <Badge variant="success" className={className}>
        <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
        {t("statusActive")}
      </Badge>
    )
  }

  if (status === "upcoming") {
    return (
      <Badge variant="info" className={className}>
        <Clock aria-hidden="true" className="size-3" />
        {t("statusUpcoming")}
      </Badge>
    )
  }

  if (status === "completed") {
    return (
      <Badge variant="secondary" className={className}>
        <CheckCircle2 aria-hidden="true" className="size-3" />
        {t("statusCompleted")}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={className}>
      <Archive aria-hidden="true" className="size-3" />
      {t("statusArchived")}
    </Badge>
  )
}
