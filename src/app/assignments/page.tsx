"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  FileCheck2,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ArrowRight,
  Filter,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { useData } from "@/lib/data-context"
import { cn } from "@/lib/utils"

export default function AssignmentsPage() {
  const t = useTranslations("assignments")
  const tCommon = useTranslations("common")

  const {
    assignments,
    cohorts,
    users,
    currentRole,
    createAssignment,
    getAssignmentSubmissions,
    getStudentAssignmentSubmission,
    getCohortMembers,
  } = useData()

  const [selectedCohortId, setSelectedCohortId] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "pending" | "submitted" | "graded">("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [createModalOpen, setCreateModalOpen] = React.useState(false)

  // Create Assignment Form State
  const [title, setTitle] = React.useState("")
  const [japanesePrompt, setJapanesePrompt] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [targetLevel, setTargetLevel] = React.useState("N5")
  const [targetCohort, setTargetCohort] = React.useState(cohorts[0]?.id || "cohort-1")
  const [dueDate, setDueDate] = React.useState("")
  const [maxScore, setMaxScore] = React.useState(100)
  const [passScore, setPassScore] = React.useState(70)
  const [formError, setFormError] = React.useState("")

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"

  // Find active student if in Gakusei mode (default to first student user-g1)
  const currentStudent = React.useMemo(() => {
    return users.find((u) => u.role === "GAKUSEI") || users[0]
  }, [users])

  // Helper to calculate deadline status
  const getDueStatus = (dueDateStr: string) => {
    const due = new Date(dueDateStr.replace(" ", "T")).getTime()
    const now = new Date().getTime()
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { label: t("overdue"), variant: "destructive" as const, isOverdue: true }
    } else if (diffDays === 0) {
      return { label: t("dueToday"), variant: "warning" as const, isOverdue: false }
    } else {
      return { label: t("dueInDays", { days: diffDays }), variant: "secondary" as const, isOverdue: false }
    }
  }

  // Normalized search query
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()

  // Filtered assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesCohort = selectedCohortId === "all" || a.cohortId === selectedCohortId
    const matchesSearch =
      normalizedSearchQuery.length === 0 ||
      a.title.toLowerCase().includes(normalizedSearchQuery) ||
      a.description.toLowerCase().includes(normalizedSearchQuery) ||
      a.instructorName.toLowerCase().includes(normalizedSearchQuery) ||
      a.targetLevel.toLowerCase().includes(normalizedSearchQuery)

    if (!matchesCohort || !matchesSearch) return false

    if (currentRole === "GAKUSEI" && currentStudent) {
      const sub = getStudentAssignmentSubmission(a.id, currentStudent.id)
      if (statusFilter === "pending") return !sub || sub.status === "PENDING"
      if (statusFilter === "submitted") return sub?.status === "SUBMITTED"
      if (statusFilter === "graded") return sub?.status === "GRADED"
    } else if (canManage) {
      const subs = getAssignmentSubmissions(a.id)
      if (statusFilter === "pending") {
        return subs.some((s) => s.status === "SUBMITTED")
      }
      if (statusFilter === "submitted") {
        return subs.length > 0
      }
      if (statusFilter === "graded") {
        return subs.some((s) => s.status === "GRADED")
      }
    }

    return true
  })

  // Counters for tabs (for Gakusei)
  const studentPendingCount = React.useMemo(() => {
    return assignments.filter((a) => {
      if (!currentStudent) return false
      const sub = getStudentAssignmentSubmission(a.id, currentStudent.id)
      return !sub || sub.status === "PENDING"
    }).length
  }, [assignments, currentStudent, getStudentAssignmentSubmission])

  const studentSubmittedCount = React.useMemo(() => {
    return assignments.filter((a) => {
      if (!currentStudent) return false
      const sub = getStudentAssignmentSubmission(a.id, currentStudent.id)
      return sub?.status === "SUBMITTED"
    }).length
  }, [assignments, currentStudent, getStudentAssignmentSubmission])

  const studentGradedCount = React.useMemo(() => {
    return assignments.filter((a) => {
      if (!currentStudent) return false
      const sub = getStudentAssignmentSubmission(a.id, currentStudent.id)
      return sub?.status === "GRADED"
    }).length
  }, [assignments, currentStudent, getStudentAssignmentSubmission])

  // Staff summary counters
  const staffPendingGradingCount = React.useMemo(() => {
    return assignments.reduce((total, a) => {
      const subs = getAssignmentSubmissions(a.id)
      return total + subs.filter((s) => s.status === "SUBMITTED").length
    }, 0)
  }, [assignments, getAssignmentSubmissions])

  const staffGradedCount = React.useMemo(() => {
    return assignments.reduce((total, a) => {
      const subs = getAssignmentSubmissions(a.id)
      return total + subs.filter((s) => s.status === "GRADED").length
    }, 0)
  }, [assignments, getAssignmentSubmissions])

  // Staff assignment-level tab counters (matching card filter predicates)
  const staffPendingAssignmentsCount = React.useMemo(() => {
    return assignments.filter((a) => {
      const subs = getAssignmentSubmissions(a.id)
      return subs.some((s) => s.status === "SUBMITTED")
    }).length
  }, [assignments, getAssignmentSubmissions])

  const staffSubmittedAssignmentsCount = React.useMemo(() => {
    return assignments.filter((a) => {
      const subs = getAssignmentSubmissions(a.id)
      return subs.length > 0
    }).length
  }, [assignments, getAssignmentSubmissions])

  const staffGradedAssignmentsCount = React.useMemo(() => {
    return assignments.filter((a) => {
      const subs = getAssignmentSubmissions(a.id)
      return subs.some((s) => s.status === "GRADED")
    }).length
  }, [assignments, getAssignmentSubmissions])

  const activeCohortsCount = React.useMemo(() => {
    const cohortIds = new Set(assignments.map((a) => a.cohortId))
    return cohortIds.size
  }, [assignments])

  const hasActiveFilters = normalizedSearchQuery.length > 0 || selectedCohortId !== "all" || statusFilter !== "all"

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCohortId("all")
    setStatusFilter("all")
  }

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setFormError(t("errorTitle"))
      return
    }
    if (!japanesePrompt.trim()) {
      setFormError(t("errorPrompt"))
      return
    }
    if (!dueDate.trim()) {
      setFormError(t("errorDueDate"))
      return
    }

    createAssignment({
      title: title.trim(),
      japanesePrompt: japanesePrompt.trim(),
      description: description.trim(),
      targetLevel,
      cohortId: targetCohort,
      dueDate,
      format: "TEXT",
      maxScore: Number(maxScore) || 100,
      passScore: Number(passScore) || 70,
      instructorId: "user-s1",
      instructorName: "田中 晶子 (Tanaka Akiko)",
    })

    // Reset form
    setTitle("")
    setJapanesePrompt("")
    setDescription("")
    setDueDate("")
    setFormError("")
    setCreateModalOpen(false)
  }

  return (
    <PageShell>
      {/* Page Header */}
      <PageHeader
        eyebrow={
          <span className="flex items-center gap-2">
            <Badge variant="outline" className="text-[0.7rem] uppercase tracking-wider text-primary border-primary/30">
              {t("badge")}
            </Badge>
            <span className="text-xs text-muted-foreground">{t("subtitle")}</span>
          </span>
        }
        title={t("title")}
        description={currentRole === "GAKUSEI" ? t("descStudent") : t("descStaff")}
        action={
          canManage ? (
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="gap-2 shadow-xs"
            >
              <Plus className="size-4" />
              <span>{t("createAssignment")}</span>
            </Button>
          ) : undefined
        }
      />

      {/* Role-Aware Metric Strip */}
      <section aria-labelledby="assignments-metrics-title">
        <h2 id="assignments-metrics-title" className="sr-only">
          {t("metricsLabel")}
        </h2>
        {currentRole === "GAKUSEI" ? (
          <div className="metric-strip">
            <div className="metric-item">
              <p className="metric-label">{t("metricAssigned")}</p>
              <p className="metric-value">{assignments.length}</p>
              <p className="metric-note">{t("metricAssignedNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("metricPending")}</p>
              <p className={cn("metric-value", studentPendingCount > 0 && "text-amber-700 dark:text-amber-300")}>
                {studentPendingCount}
              </p>
              <p className="metric-note">{t("metricPendingNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("metricSubmitted")}</p>
              <p className="metric-value text-primary">{studentSubmittedCount}</p>
              <p className="metric-note">{t("metricSubmittedNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("metricGraded")}</p>
              <p className="metric-value text-emerald-700 dark:text-emerald-300">{studentGradedCount}</p>
              <p className="metric-note">{t("metricGradedNote")}</p>
            </div>
          </div>
        ) : (
          <div className="metric-strip">
            <div className="metric-item">
              <p className="metric-label">{t("metricTotalAssignments")}</p>
              <p className="metric-value">{assignments.length}</p>
              <p className="metric-note">{t("metricTotalAssignmentsNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("metricPendingGrading")}</p>
              <p className={cn("metric-value", staffPendingGradingCount > 0 && "text-amber-700 dark:text-amber-300")}>
                {staffPendingGradingCount}
              </p>
              <p className="metric-note">{t("metricPendingGradingNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("metricGradedTotal")}</p>
              <p className="metric-value text-emerald-700 dark:text-emerald-300">{staffGradedCount}</p>
              <p className="metric-note">{t("metricGradedTotalNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("metricActiveCohorts")}</p>
              <p className="metric-value text-indigo-700 dark:text-indigo-300">{activeCohortsCount}</p>
              <p className="metric-note">{t("metricActiveCohortsNote")}</p>
            </div>
          </div>
        )}
      </section>

      {/* Student Urgent Notice Banner (if any pending) */}
      {currentRole === "GAKUSEI" && studentPendingCount > 0 && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-50/40 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <Clock3 className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="font-medium">
              <span className="font-bold">{t("urgentNoticeTitle")}:</span> {t("urgentNoticeDesc")}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setStatusFilter("pending")}
            className="border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 text-xs shrink-0 self-end sm:self-auto"
          >
            {t("filterPendingAction")}
          </Button>
        </div>
      )}

      {/* Main Section */}
      <section aria-labelledby="assignments-list-title" className="space-y-4">
        <SectionHeader
          title={<span id="assignments-list-title">{t("title")}</span>}
          description={
            <span aria-live="polite">
              {t("resultsSummary", { shown: filteredAssignments.length, total: assignments.length })}
            </span>
          }
          action={
            hasActiveFilters ? (
              <Button type="button" variant="ghost" size="xs" onClick={resetFilters} className="text-xs">
                {t("resetFilters")}
              </Button>
            ) : undefined
          }
        />

        {/* Controls & Filter Bar */}
        <div className="filter-toolbar">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter Tabs */}
            <div
              role="group"
              aria-label={t("filterStatus")}
              className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60 overflow-x-auto"
            >
              <button
                type="button"
                aria-pressed={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "min-h-8 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  statusFilter === "all"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t("tabAll", { count: assignments.length })}
              </button>
              <button
                type="button"
                aria-pressed={statusFilter === "pending"}
                onClick={() => setStatusFilter("pending")}
                className={cn(
                  "min-h-8 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  statusFilter === "pending"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t("tabPending", { count: currentRole === "GAKUSEI" ? studentPendingCount : staffPendingAssignmentsCount })}
              </button>
              <button
                type="button"
                aria-pressed={statusFilter === "submitted"}
                onClick={() => setStatusFilter("submitted")}
                className={cn(
                  "min-h-8 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  statusFilter === "submitted"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t("tabSubmitted", { count: currentRole === "GAKUSEI" ? studentSubmittedCount : staffSubmittedAssignmentsCount })}
              </button>
              <button
                type="button"
                aria-pressed={statusFilter === "graded"}
                onClick={() => setStatusFilter("graded")}
                className={cn(
                  "min-h-8 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  statusFilter === "graded"
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t("tabGraded", { count: currentRole === "GAKUSEI" ? studentGradedCount : staffGradedAssignmentsCount })}
              </button>
            </div>

            {/* Cohort Select Filter */}
            <div className="flex items-center gap-1.5">
              <Filter aria-hidden="true" className="size-3.5 text-muted-foreground ml-1" />
              <select
                aria-label={t("filterCohort")}
                value={selectedCohortId}
                onChange={(e) => setSelectedCohortId(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">{t("allCohorts")}</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label={t("searchPlaceholder")}
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9 bg-card"
            />
          </div>
        </div>

        {/* Assignment Cards Grid */}
        {filteredAssignments.length === 0 ? (
          <EmptyState
            icon={<FileCheck2 className="size-5" />}
            title={t("noAssignmentsFound")}
            description={hasActiveFilters ? t("noAssignmentsDesc") : (currentRole === "GAKUSEI" ? t("descStudent") : t("descStaff"))}
            action={
              hasActiveFilters ? (
                <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                  {t("resetFilters")}
                </Button>
              ) : canManage ? (
                <Button type="button" size="sm" onClick={() => setCreateModalOpen(true)} className="gap-2">
                  <Plus className="size-4" />
                  {t("createAssignment")}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssignments.map((assignment) => {
              const cohort = cohorts.find((c) => c.id === assignment.cohortId)
              const dueStatus = getDueStatus(assignment.dueDate)
              const studentSub = currentStudent
                ? getStudentAssignmentSubmission(assignment.id, currentStudent.id)
                : null
              const submissions = getAssignmentSubmissions(assignment.id)
              const cohortMembers = cohort ? getCohortMembers(cohort.id) : null
              const totalStudents = cohortMembers?.students.length || 0

              return (
                <Card
                  key={assignment.id}
                  className="flex flex-col justify-between border-border/80 hover:border-border transition-all duration-200 shadow-xs hover:shadow-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="font-mono text-[0.7rem]">
                          {assignment.targetLevel}
                        </Badge>
                        {cohort && (
                          <Link href={`/cohorts/${cohort.id}`}>
                            <Badge variant="secondary" className="font-mono text-[0.7rem] hover:bg-secondary/80">
                              {cohort.code}
                            </Badge>
                          </Link>
                        )}
                      </div>
                      <Badge variant={dueStatus.variant} className="text-[0.68rem] py-0 px-2 font-medium">
                        {dueStatus.label}
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-semibold leading-snug">
                      {assignment.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2 mt-1">
                      {assignment.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    {/* Meta Details */}
                    <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {assignment.dueDate}
                        </span>
                        <span>{t("passScoreLabel", { score: assignment.passScore })}</span>
                      </div>

                      <div className="flex items-center justify-between text-[0.72rem]">
                        <span>{assignment.instructorName}</span>
                        <span>{t("maxScoreLabel", { score: assignment.maxScore })}</span>
                      </div>
                    </div>

                    {/* Role Specific Status & Actions */}
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                      {currentRole === "GAKUSEI" ? (
                        <div>
                          {studentSub?.status === "GRADED" ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="size-3.5" />
                              <span>{t("statusGraded", { score: studentSub.score || 0, max: assignment.maxScore })}</span>
                            </div>
                          ) : studentSub?.status === "SUBMITTED" ? (
                            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                              <CheckCircle2 className="size-3.5" />
                              <span>{t("statusSubmitted")}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                              <AlertCircle className="size-3.5" />
                              <span>{t("statusPending")}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          {t("submissionsCount", { submitted: submissions.length, total: totalStudents })}
                        </div>
                      )}

                      <Link
                        href={`/assignments/${assignment.id}`}
                        aria-label={`${canManage ? t("gradeSubmissions") : t("viewTask")}: ${assignment.title}`}
                        className={cn(buttonVariants({ size: "xs", variant: "default" }), "gap-1 text-xs shadow-xs")}
                      >
                        <span>{canManage ? t("gradeSubmissions") : t("viewTask")}</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Create Assignment Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent closeLabel={tCommon("close")} className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t("modalTitle")}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("modalDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
            {formError && (
              <div role="alert" aria-live="polite" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {formError}
              </div>
            )}

            <div>
              <label htmlFor="assignment-create-title" className="block font-medium mb-1">
                {t("modalFieldTitle")}
              </label>
              <Input
                id="assignment-create-title"
                name="title"
                placeholder={t("modalFieldTitlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label htmlFor="assignment-create-prompt" className="block font-medium mb-1">
                {t("modalFieldPrompt")}
              </label>
              <Textarea
                id="assignment-create-prompt"
                name="japanesePrompt"
                rows={3}
                placeholder={t("modalFieldPromptPlaceholder")}
                value={japanesePrompt}
                onChange={(e) => setJapanesePrompt(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-sans"
              />
            </div>

            <div>
              <label htmlFor="assignment-create-desc" className="block font-medium mb-1">
                {t("modalFieldDesc")}
              </label>
              <Input
                id="assignment-create-desc"
                name="description"
                placeholder={t("modalFieldDescPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="assignment-create-level" className="block font-medium mb-1">
                  {t("modalFieldLevel")}
                </label>
                <select
                  id="assignment-create-level"
                  name="targetLevel"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="N5">JLPT N5</option>
                  <option value="N4">JLPT N4</option>
                  <option value="N3">JLPT N3</option>
                </select>
              </div>

              <div>
                <label htmlFor="assignment-create-cohort" className="block font-medium mb-1">
                  {t("modalFieldCohort")}
                </label>
                <select
                  id="assignment-create-cohort"
                  name="targetCohort"
                  value={targetCohort}
                  onChange={(e) => setTargetCohort(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="assignment-create-duedate" className="block font-medium mb-1">
                  {t("modalFieldDueDate")}
                </label>
                <Input
                  id="assignment-create-duedate"
                  name="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label htmlFor="assignment-create-maxscore" className="block font-medium mb-1">
                  {t("modalFieldMaxScore")}
                </label>
                <Input
                  id="assignment-create-maxscore"
                  name="maxScore"
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label htmlFor="assignment-create-passscore" className="block font-medium mb-1">
                  {t("modalFieldPassScore")}
                </label>
                <Input
                  id="assignment-create-passscore"
                  name="passScore"
                  type="number"
                  value={passScore}
                  onChange={(e) => setPassScore(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" size="sm">
                {t("modalSubmit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
