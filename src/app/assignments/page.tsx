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

  // Filtered assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesCohort = selectedCohortId === "all" || a.cohortId === selectedCohortId
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.targetLevel.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesCohort || !matchesSearch) return false

    if (currentRole === "GAKUSEI" && currentStudent) {
      const sub = getStudentAssignmentSubmission(a.id, currentStudent.id)
      if (statusFilter === "pending") return !sub || sub.status === "PENDING"
      if (statusFilter === "submitted") return sub?.status === "SUBMITTED"
      if (statusFilter === "graded") return sub?.status === "GRADED"
    }

    return true
  })

  // Counters for tabs (for Gakusei)
  const studentPendingCount = assignments.filter((a) => {
    if (!currentStudent) return false
    const sub = getStudentAssignmentSubmission(a.id, currentStudent.id)
    return !sub || sub.status === "PENDING"
  }).length

  const studentSubmittedCount = assignments.filter((a) => {
    if (!currentStudent) return false
    const sub = getStudentAssignmentSubmission(a.id, currentStudent.id)
    return sub?.status === "SUBMITTED"
  }).length

  const studentGradedCount = assignments.filter((a) => {
    if (!currentStudent) return false
    const sub = getStudentAssignmentSubmission(a.id, currentStudent.id)
    return sub?.status === "GRADED"
  }).length

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
    <div className="page-shell">
      {/* Header Section */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[0.7rem] uppercase tracking-wider text-primary border-primary/30">
              {t("badge")}
            </Badge>
            <span className="text-xs text-muted-foreground">{t("subtitle")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            {currentRole === "GAKUSEI" ? t("descStudent") : t("descStaff")}
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="gap-2 shadow-xs bg-primary text-primary-foreground shrink-0 self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>{t("createAssignment")}</span>
          </Button>
        )}
      </div>

      {/* Student Urgent Notice Banner (if any pending) */}
      {currentRole === "GAKUSEI" && studentPendingCount > 0 && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-50/40 dark:bg-amber-950/20 p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <Clock3 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="font-medium">
              {t("tabPending", { count: studentPendingCount })}: Jangan lewatkan batas waktu penyerahan komposisi bahasa Jepang Anda.
            </span>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setStatusFilter("pending")}
            className="border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 text-xs shrink-0"
          >
            Filter Belum Dikumpulkan
          </Button>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="filter-toolbar">
        {/* Status Filter Tabs (For Student) */}
        {currentRole === "GAKUSEI" ? (
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60 overflow-x-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("tabAll", { count: assignments.length })}
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                statusFilter === "pending"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("tabPending", { count: studentPendingCount })}
            </button>
            <button
              onClick={() => setStatusFilter("submitted")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                statusFilter === "submitted"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("tabSubmitted", { count: studentSubmittedCount })}
            </button>
            <button
              onClick={() => setStatusFilter("graded")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                statusFilter === "graded"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("tabGraded", { count: studentGradedCount })}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">{t("filterCohort")}</span>
            <select
              value={selectedCohortId}
              onChange={(e) => setSelectedCohortId(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Semua Kohort</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
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
        <div className="empty-state">
          <FileCheck2 className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="mt-4 text-base font-semibold">{t("noAssignmentsFound")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t("noAssignmentsDesc")}</p>
        </div>
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
                        <Clock className="h-3 w-3" />
                        {assignment.dueDate}
                      </span>
                      <span>Pass: {assignment.passScore} pts</span>
                    </div>

                    <div className="flex items-center justify-between text-[0.72rem]">
                      <span>{assignment.instructorName}</span>
                      <span>Max {assignment.maxScore} pts</span>
                    </div>
                  </div>

                  {/* Role Specific Status & Actions */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    {currentRole === "GAKUSEI" ? (
                      <div>
                        {studentSub?.status === "GRADED" ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t("statusGraded", { score: studentSub.score || 0, max: assignment.maxScore })}</span>
                          </div>
                        ) : studentSub?.status === "SUBMITTED" ? (
                          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t("statusSubmitted")}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{t("statusPending")}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {submissions.length}/{totalStudents}
                        </span>{" "}
                        dikumpulkan
                      </div>
                    )}

                    <Link href={`/assignments/${assignment.id}`}>
                      <Button size="xs" variant="default" className="gap-1 text-xs shadow-xs">
                        <span>{canManage ? t("gradeSubmissions") : t("viewTask")}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg">
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
              <label className="block font-medium mb-1">{t("modalFieldTitle")}</label>
              <Input
                placeholder={t("modalFieldTitlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">{t("modalFieldPrompt")}</label>
              <Textarea
                rows={3}
                placeholder={t("modalFieldPromptPlaceholder")}
                value={japanesePrompt}
                onChange={(e) => setJapanesePrompt(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-sans"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">{t("modalFieldDesc")}</label>
              <Input
                placeholder={t("modalFieldDescPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">{t("modalFieldLevel")}</label>
                <select
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
                <label className="block font-medium mb-1">{t("modalFieldCohort")}</label>
                <select
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
                <label className="block font-medium mb-1">{t("modalFieldDueDate")}</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">{t("modalFieldMaxScore")}</label>
                <Input
                  type="number"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">{t("modalFieldPassScore")}</label>
                <Input
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
    </div>
  )
}
