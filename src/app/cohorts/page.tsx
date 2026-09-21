"use client"

import * as React from "react"
import Link from "next/link"
import {
  Layers,
  Plus,
  Search,
  Calendar,
  Users,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useData } from "@/lib/data-context"
import { type CohortStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { CohortStatusBadge } from "@/components/cohorts/cohort-status-badge"

export default function CohortsPage() {
  const t = useTranslations("cohorts")
  const tCommon = useTranslations("common")

  const { cohorts, users, currentRole, addCohort, getCohortMembers } = useData()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | CohortStatus>("all")
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  // Form state
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [targetLevel, setTargetLevel] = React.useState("N5 → N4")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [status, setStatus] = React.useState<CohortStatus>("active")
  const [formError, setFormError] = React.useState("")

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const hasActiveFilters = normalizedSearchQuery.length > 0 || statusFilter !== "all"

  const openCreateDialog = () => {
    setFormError("")
    setCreateDialogOpen(true)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
  }

  // Filtered cohorts
  const filteredCohorts = cohorts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(normalizedSearchQuery) ||
      c.code.toLowerCase().includes(normalizedSearchQuery) ||
      c.description.toLowerCase().includes(normalizedSearchQuery)
    const matchesStatus = statusFilter === "all" || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Metrics
  const activeCohortsCount = cohorts.filter((c) => c.status === "active").length
  const totalStudentsCount = users.filter((u) => u.role === "GAKUSEI").length
  const totalSenseiCount = users.filter((u) => u.role === "SENSEI").length

  const handleCreateCohort = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setFormError(t("errorNameRequired"))
      return
    }
    if (!code.trim()) {
      setFormError(t("errorCodeRequired"))
      return
    }
    // Check code uniqueness
    if (cohorts.some((c) => c.code.toLowerCase() === code.trim().toLowerCase())) {
      setFormError(t("errorCodeExists"))
      return
    }

    addCohort({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim() || t("defaultDescription"),
      targetLevel,
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || "2026-12-31",
      status,
    })

    // Reset & close
    setName("")
    setCode("")
    setDescription("")
    setStartDate("")
    setEndDate("")
    setFormError("")
    setCreateDialogOpen(false)
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("badge")}
        title={t("title")}
        description={t("desc")}
        action={
          canManage ? (
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus aria-hidden="true" className="size-4" />
              {t("createCohort")}
            </Button>
          ) : (
            <Badge variant="roleGakusei">{tCommon("roleGakusei")}</Badge>
          )
        }
      />

      <section aria-labelledby="cohort-metrics-title">
        <h2 id="cohort-metrics-title" className="sr-only">{t("metricsLabel")}</h2>
        <div className="metric-strip grid-cols-1 divide-x-0 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="metric-item">
            <p className="metric-label">{t("statActiveCohorts")}</p>
            <p className="metric-value text-primary">
              {activeCohortsCount} <span className="text-sm font-normal text-muted-foreground">/ {cohorts.length}</span>
            </p>
            <p className="metric-note">{t("statusActive")}</p>
          </div>
          <div className="metric-item">
            <p className="metric-label">{t("statTotalStudents")}</p>
            <p className="metric-value">{totalStudentsCount}</p>
            <p className="metric-note">{tCommon("roleGakusei")}</p>
          </div>
          <div className="metric-item">
            <p className="metric-label">{t("statTotalTeachers")}</p>
            <p className="metric-value">{totalSenseiCount}</p>
            <p className="metric-note">{tCommon("roleSensei")}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="cohort-list-title" className="space-y-4">
        <SectionHeader
          title={<span id="cohort-list-title">{t("listTitle")}</span>}
          description={
            <span aria-live="polite">
              {t("resultsSummary", { shown: filteredCohorts.length, total: cohorts.length })}
            </span>
          }
        />

        <div className="filter-toolbar">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label={t("searchPlaceholder")}
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-card pl-9"
            />
          </div>

          <div
            role="group"
            aria-label={t("filterStatus")}
            className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-lg border border-border/60 bg-muted/50 p-1"
          >
            <Filter aria-hidden="true" className="ml-2 mr-1 size-3.5 shrink-0 text-muted-foreground" />
            {(
              [
                { id: "all", label: t("filterAll") },
                { id: "active", label: t("statusActive") },
                { id: "upcoming", label: t("statusUpcoming") },
                { id: "completed", label: t("statusCompleted") },
                { id: "archived", label: t("statusArchived") },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={statusFilter === tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "min-h-9 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  statusFilter === tab.id
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

      {filteredCohorts.length === 0 ? (
        <EmptyState
          icon={<Layers className="size-5" />}
          title={t("noCohortsFound")}
          description={t("noCohortsDesc")}
          action={
            hasActiveFilters ? (
              <Button type="button" variant="outline" onClick={resetFilters}>
                {t("resetFilters")}
              </Button>
            ) : canManage ? (
              <Button type="button" onClick={openCreateDialog} className="gap-2">
                <Plus aria-hidden="true" className="size-4" />
                {t("createCohort")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCohorts.map((cohort) => {
            const members = getCohortMembers(cohort.id)
            return (
              <li key={cohort.id} className="min-w-0">
                <Link
                  href={`/cohorts/${cohort.id}`}
                  aria-label={`${t("viewRoster")}: ${cohort.name}`}
                  className="group block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
                >
                  <Card className="flex h-full flex-col overflow-hidden border-border/80 transition-colors hover:border-primary/40 hover:bg-muted/10">
                    <div className="flex-1">
                      <CardHeader className="p-5 pb-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="rounded border border-border/50 bg-muted/60 px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
                            {cohort.code}
                          </span>
                          <CohortStatusBadge status={cohort.status} className="gap-1 text-xs" />
                        </div>
                        <CardTitle className="text-base transition-colors group-hover:text-primary sm:text-lg">
                          {cohort.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge variant="outline" className="px-1.5 py-0 text-[0.7rem] font-normal">
                            {cohort.targetLevel}
                          </Badge>
                        </div>
                        <CardDescription className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                          {cohort.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3 p-5 pt-0 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar aria-hidden="true" className="size-3.5 shrink-0" />
                          <span>{cohort.startDate} 〜 {cohort.endDate}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/40 p-2.5">
                          <div className="flex items-center gap-1.5">
                            <GraduationCap aria-hidden="true" className="size-4 text-indigo-500" />
                            <span className="font-medium tabular-nums">{members.students.length}</span>
                            <span className="text-[0.7rem] text-muted-foreground">{tCommon("roleGakusei")}</span>
                          </div>
                          <div aria-hidden="true" className="h-3 w-px bg-border" />
                          <div className="flex items-center gap-1.5">
                            <Users aria-hidden="true" className="size-4 text-emerald-500" />
                            <span className="font-medium tabular-nums">{members.teachers.length}</span>
                            <span className="text-[0.7rem] text-muted-foreground">{tCommon("roleSensei")}</span>
                          </div>
                          <div aria-hidden="true" className="h-3 w-px bg-border" />
                          <div className="flex items-center gap-1.5">
                            <Sparkles aria-hidden="true" className="size-4 text-purple-500" />
                            <span className="font-medium tabular-nums">{members.coordinators.length}</span>
                            <span className="text-[0.7rem] text-muted-foreground">{tCommon("roleTantosha")}</span>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/60 bg-muted/10 px-5 py-3">
                      <span className="text-xs text-muted-foreground">{cohort.createdAt}</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                        {t("viewRoster")}
                        <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      </section>

      {/* Create Cohort Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md" closeLabel={tCommon("close")}>
          <DialogHeader>
            <DialogTitle>{t("modalTitle")}</DialogTitle>
            <DialogDescription>
              {t("modalDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCohort} className="space-y-4 text-sm">
            {formError && (
              <div role="alert" aria-live="polite" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {formError}
              </div>
            )}

            <div>
              <label htmlFor="cohort-create-name" className="block text-xs font-medium mb-1">
                {t("modalName")}
              </label>
              <Input
                id="cohort-create-name"
                name="name"
                placeholder={t("modalNamePlaceholder")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  // auto-generate code if code is empty
                  if (!code) {
                    const match = e.target.value.match(/\d+/)
                    if (match) {
                      setCode(`KNS-2027-0${match[0]}`)
                    }
                  }
                }}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="cohort-create-code" className="block text-xs font-medium mb-1">
                  {t("modalCode")}
                </label>
                <Input
                  id="cohort-create-code"
                  name="code"
                  placeholder={t("modalCodePlaceholder")}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono"
                  required
                />
              </div>
              <div>
                <label htmlFor="cohort-create-level" className="block text-xs font-medium mb-1">
                  {t("modalTargetLevel")}
                </label>
                <select
                  id="cohort-create-level"
                  name="targetLevel"
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                >
                  <option value="N5 Foundation">N5 Foundation</option>
                  <option value="N5 → N4">N5 → N4</option>
                  <option value="N4 Intermediate">N4 Intermediate</option>
                  <option value="N3 Preparatory">N3 Preparatory</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="cohort-create-start-date" className="block text-xs font-medium mb-1">
                  {t("modalStartDate")}
                </label>
                <Input
                  id="cohort-create-start-date"
                  name="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="cohort-create-end-date" className="block text-xs font-medium mb-1">
                  {t("modalEndDate")}
                </label>
                <Input
                  id="cohort-create-end-date"
                  name="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="cohort-create-status" className="block text-xs font-medium mb-1">
                {t("filterStatus")}
              </label>
              <select
                id="cohort-create-status"
                name="status"
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={status}
                onChange={(e) => setStatus(e.target.value as CohortStatus)}
              >
                <option value="active">{t("statusActive")}</option>
                <option value="upcoming">{t("statusUpcoming")}</option>
                <option value="completed">{t("statusCompleted")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="cohort-create-description" className="block text-xs font-medium mb-1">
                {t("modalDescLabel")}
              </label>
              <Textarea
                id="cohort-create-description"
                name="description"
                className="w-full min-h-[70px] rounded-md border border-input bg-transparent p-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={t("modalDescPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit">{t("modalSubmit")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
