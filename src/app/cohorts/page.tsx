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
  CheckCircle2,
  Clock,
  Archive,
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

  // Filtered cohorts
  const filteredCohorts = cohorts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
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
      setFormError("コホート名を入力してください (Please enter cohort name)")
      return
    }
    if (!code.trim()) {
      setFormError("コホート識別コードを入力してください (Please enter cohort code)")
      return
    }
    // Check code uniqueness
    if (cohorts.some((c) => c.code.toLowerCase() === code.trim().toLowerCase())) {
      setFormError("このコードは既に使用されています (This code is already in use)")
      return
    }

    addCohort({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim() || "日本奨学金プログラム研修生コホート",
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

  const getStatusBadge = (s: CohortStatus) => {
    switch (s) {
      case "active":
        return (
          <Badge variant="success" className="gap-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t("statusActive")}
          </Badge>
        )
      case "upcoming":
        return (
          <Badge variant="info" className="gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {t("statusUpcoming")}
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="gap-1 text-xs">
            <CheckCircle2 className="h-3 w-3" />
            {t("statusCompleted")}
          </Badge>
        )
      case "archived":
        return (
          <Badge variant="outline" className="gap-1 text-xs">
            <Archive className="h-3 w-3" />
            {t("statusArchived")}
          </Badge>
        )
    }
  }

  return (
    <div className="page-shell">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <Badge variant="outline" className="text-xs font-normal">
              {t("badge")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("desc")}
          </p>
        </div>

        {/* Action Button */}
        {canManage ? (
          <Button
            onClick={() => {
              setFormError("")
              setCreateDialogOpen(true)
            }}
            className="gap-2 shadow-xs sm:self-start"
          >
            <Plus className="h-4 w-4" />
            {t("createCohort")}
          </Button>
        ) : (
          <div className="text-xs bg-muted/60 text-muted-foreground px-3 py-1.5 rounded-md border border-border/60">
            {tCommon("roleGakusei")}
          </div>
        )}
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("statActiveCohorts")}</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-primary">
                {activeCohortsCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">/ {cohorts.length}</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("statTotalStudents")}</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                {totalStudentsCount}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("statTotalTeachers")}</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                {totalSenseiCount}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={t("searchPlaceholder")}
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-muted/50 rounded-lg border border-border/60">
          <Filter className="h-3.5 w-3.5 text-muted-foreground ml-2 mr-1 shrink-0" />
          {(
            [
              { id: "all", label: t("filterAll") },
              { id: "active", label: t("statusActive") },
              { id: "upcoming", label: t("statusUpcoming") },
              { id: "completed", label: t("statusCompleted") },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "min-h-9 px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors",
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

      {/* Cohorts Grid */}
      {filteredCohorts.length === 0 ? (
        <div className="empty-state">
          <Layers className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="mt-4 text-base font-semibold">{t("noCohortsFound")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("noCohortsDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCohorts.map((cohort) => {
            const members = getCohortMembers(cohort.id)
            return (
              <Card
                key={cohort.id}
                className="group flex flex-col justify-between overflow-hidden border-border/80 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/50">
                        {cohort.code}
                      </span>
                      {getStatusBadge(cohort.status)}
                    </div>
                    <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors">
                      {cohort.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-[0.7rem] py-0 px-1.5 font-normal">
                        {cohort.targetLevel}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 mt-2 text-xs text-muted-foreground">
                      {cohort.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3 text-xs">
                    {/* Date info */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {cohort.startDate} 〜 {cohort.endDate}
                      </span>
                    </div>

                    {/* Roster counts */}
                    <div className="rounded-lg bg-muted/40 p-2.5 flex items-center justify-between border border-border/40">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">{members.students.length}</span>
                        <span className="text-muted-foreground text-[0.7rem]">{tCommon("roleGakusei")}</span>
                      </div>
                      <div className="h-3 w-px bg-border" />
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium">{members.teachers.length}</span>
                        <span className="text-muted-foreground text-[0.7rem]">{tCommon("roleSensei")}</span>
                      </div>
                      <div className="h-3 w-px bg-border" />
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{members.coordinators.length}</span>
                        <span className="text-muted-foreground text-[0.7rem]">{tCommon("roleTantosha")}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Card Action Link */}
                <div className="border-t border-border/60 bg-muted/10 p-3 px-5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {cohort.createdAt}
                  </span>
                  <Link href={`/cohorts/${cohort.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 group-hover:bg-primary group-hover:text-primary-foreground">
                      {t("viewRoster")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Cohort Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
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
              <label className="block text-xs font-medium mb-1">
                {t("modalName")}
              </label>
              <Input
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  {t("modalCode")}
                </label>
                <Input
                  placeholder={t("modalCodePlaceholder")}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  {t("modalTargetLevel")}
                </label>
                <select
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  {t("modalStartDate")}
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  {t("modalEndDate")}
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                {t("filterStatus")}
              </label>
              <select
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
              <label className="block text-xs font-medium mb-1">
                {t("modalDescLabel")}
              </label>
              <Textarea
                className="w-full min-h-[70px] rounded-md border border-input bg-transparent p-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="研修の目的や対象奨学生の概要を入力..."
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
    </div>
  )
}
