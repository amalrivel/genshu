"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  Award,
  Plus,
  Search,
  Clock,
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
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { EmptyState } from "@/components/ui/empty-state"
import { useData } from "@/lib/data-context"
import { type ExamStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function ExamsPage() {
  const t = useTranslations("exams")
  const tCommon = useTranslations("common")

  const {
    exams,
    cohorts,
    users,
    currentRole,
    addExam,
    getExamAttempts,
    getStudentExamAttempt,
  } = useData()

  const [selectedCohort, setSelectedCohort] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  // For students: "all" | "available" | "completed"
  // For staff: "all" | "ACTIVE" | "UPCOMING" | "CLOSED"
  const [studentTab, setStudentTab] = React.useState<"all" | "available" | "completed">("all")
  const [staffTab, setStaffTab] = React.useState<"all" | ExamStatus>("all")
  const [createModalOpen, setCreateModalOpen] = React.useState(false)

  // Form states for creating a new exam
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [cohortId, setCohortId] = React.useState(cohorts[0]?.id || "")
  const [targetLevel, setTargetLevel] = React.useState<"N5" | "N4" | "N3" | "N2" | "N1">("N5")
  const [durationMinutes, setDurationMinutes] = React.useState(30)
  const [passScore, setPassScore] = React.useState(70)
  const [allowFurigana, setAllowFurigana] = React.useState(false)
  const [formError, setFormError] = React.useState("")

  const currentStudent = React.useMemo(() => {
    return users.find((u) => u.role === "GAKUSEI") || users[0]
  }, [users])

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"

  // Normalized search query
  const normalizedQuery = searchQuery.trim().toLowerCase()

  // Filter exams
  const filteredExams = React.useMemo(() => {
    return exams.filter((exam) => {
      // Cohort filter
      if (selectedCohort !== "all" && exam.cohortId !== selectedCohort) {
        return false
      }
      // Search query
      if (normalizedQuery) {
        const matchTitle = exam.title.toLowerCase().includes(normalizedQuery)
        const matchDesc = exam.description?.toLowerCase().includes(normalizedQuery)
        const matchLevel = exam.targetLevel.toLowerCase().includes(normalizedQuery)
        if (!matchTitle && !matchDesc && !matchLevel) return false
      }
      // Role-specific Status/Lifecycle filter
      if (currentRole === "GAKUSEI") {
        if (!currentStudent) return true
        const attempt = getStudentExamAttempt(exam.id, currentStudent.id)
        if (studentTab === "available") {
          // Available: exam is active and student has not yet completed it
          if (exam.status !== "ACTIVE" || Boolean(attempt)) return false
        } else if (studentTab === "completed") {
          // Completed: student has completed an attempt
          if (!attempt) return false
        }
      } else {
        // Staff lifecycle filter
        if (staffTab !== "all" && exam.status !== staffTab) {
          return false
        }
      }
      return true
    })
  }, [
    exams,
    selectedCohort,
    normalizedQuery,
    studentTab,
    staffTab,
    currentRole,
    currentStudent,
    getStudentExamAttempt,
  ])

  const hasActiveFilters =
    Boolean(normalizedQuery) ||
    selectedCohort !== "all" ||
    (currentRole === "GAKUSEI" ? studentTab !== "all" : staffTab !== "all")

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCohort("all")
    if (currentRole === "GAKUSEI") {
      setStudentTab("all")
    } else {
      setStaffTab("all")
    }
  }

  // Aggregate stats
  const stats = React.useMemo(() => {
    if (currentRole === "GAKUSEI" && currentStudent) {
      let attempted = 0
      let passed = 0
      let totalScore = 0

      exams.forEach((ex) => {
        const att = getStudentExamAttempt(ex.id, currentStudent.id)
        if (att) {
          attempted++
          if (att.passed) passed++
          totalScore += att.percentage
        }
      })

      const avg = attempted > 0 ? Math.round(totalScore / attempted) : 0
      return { total: exams.length, primary: attempted, passed, avg }
    } else {
      let totalAttemptsCount = 0
      let totalPassedCount = 0
      let totalPercentage = 0

      exams.forEach((ex) => {
        const atts = getExamAttempts(ex.id)
        atts.forEach((a) => {
          totalAttemptsCount++
          if (a.passed) totalPassedCount++
          totalPercentage += a.percentage
        })
      })

      const avg = totalAttemptsCount > 0 ? Math.round(totalPercentage / totalAttemptsCount) : 0
      return { total: exams.length, primary: totalAttemptsCount, passed: totalPassedCount, avg }
    }
  }, [exams, currentRole, currentStudent, getStudentExamAttempt, getExamAttempts])

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !cohortId) {
      setFormError(t("errorFillFields"))
      return
    }

    // Default authentic sample questions for teacher quick creation
    const sampleQuestions = [
      {
        id: `eq-${Date.now()}-1`,
        prompt: "毎日の習慣について、正しい助詞を選びなさい。\n私は毎朝、新聞（　　）読みます。",
        promptPlain: "毎日の習慣について、正しい助詞を選びなさい。\n私は毎朝、新聞（　　）読みます。",
        translationId: "Pilihlah partikel yang tepat: 'Setiap pagi saya membaca koran.'",
        options: ["を", "に", "で", "が"],
        correctAnswerIndex: 0,
        explanationJa: "読む動作の対象（目的語）には助詞「を」を使います。",
        explanationId: "Partikel 'を' (o) menandai objek dari kata kerja membaca.",
        points: 25,
      },
      {
        id: `eq-${Date.now()}-2`,
        prompt: "来週の予定を話します。\n来週、日本へ（　　）予定です。",
        promptPlain: "来週の予定を話します。\n来週、日本へ（　　）予定です。",
        translationId: "Minggu depan berencana (pergi) ke Jepang.",
        options: ["行く", "行きます", "行った", "行かない"],
        correctAnswerIndex: 0,
        explanationJa: "「予定です」の前には動詞の辞書形（行く）が接続します。",
        explanationId: "Pola '〜予定です' (berencana) didahului kata kerja bentuk kamus (jishokei).",
        points: 25,
      },
      {
        id: `eq-${Date.now()}-3`,
        prompt: "病院で薬をもらいました。食後に（　　）ください。",
        promptPlain: "病院で薬をもらいました。食後に（　　）ください。",
        translationId: "Minumlah obat ini setelah makan.",
        options: ["飲んで", "飲みて", "飲むで", "飲まないで"],
        correctAnswerIndex: 0,
        explanationJa: "「飲む」のて形は「飲んで」です。",
        explanationId: "Bentuk -te dari kata kerja '飲む' (nomu) adalah '飲んで' (nonde).",
        points: 25,
      },
      {
        id: `eq-${Date.now()}-4`,
        prompt: "【読解】明日は朝9時に駅の西口で集合します。雨が降っても出発しますので、傘を忘れないでください。\n質問: 明日はどのような天気でも出発しますか。",
        promptPlain: "【読解】明日は朝9時に駅の西口で集合します。雨が降っても出発しますので、傘を忘れないでください。\n質問: 明日はどのような天気でも出発しますか。",
        translationId: "[Bacaan] Besok berkumpul jam 9 di pintu barat stasiun. Karena tetap berangkat meskipun hujan, jangan lupa bawa payung. Pertanyaan: Apakah besok tetap berangkat meski hujan?",
        options: ["はい、出発します", "いいえ、中止です", "午後から出発します", "傘があれば中止です"],
        correctAnswerIndex: 0,
        explanationJa: "本文に「雨が降っても出発します」と明確に記載されています。",
        explanationId: "Teks secara eksplisit menyebutkan '雨が降っても出発します' (tetap berangkat meski hujan).",
        points: 25,
      },
    ]

    addExam({
      cohortId,
      title: title.trim(),
      description: description.trim(),
      targetLevel,
      durationMinutes: Number(durationMinutes) || 30,
      passScore: Number(passScore) || 70,
      allowFurigana,
      status: "ACTIVE",
      instructorId: "user-s1",
      instructorName: "田中 晶子 (Tanaka Akiko)",
      questions: sampleQuestions,
    })

    setTitle("")
    setDescription("")
    setDurationMinutes(30)
    setPassScore(70)
    setAllowFurigana(false)
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
              {t("badgeAssessment")}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {currentRole === "GAKUSEI" ? tCommon("roleGakusei") : tCommon("roleSensei")}
            </span>
          </span>
        }
        title={t("title")}
        description={currentRole === "GAKUSEI" ? t("descStudent") : t("descStaff")}
        action={
          canManage ? (
            <Button
              onClick={() => {
                setFormError("")
                setCreateModalOpen(true)
              }}
              className="gap-2 shadow-xs"
            >
              <Plus className="size-4" />
              <span>{t("createExam")}</span>
            </Button>
          ) : undefined
        }
      />

      {/* Role-Aware Metric Strip */}
      <section aria-labelledby="exams-metrics-title">
        <h2 id="exams-metrics-title" className="sr-only">
          {t("metricsLabel")}
        </h2>
        {currentRole === "GAKUSEI" ? (
          <div className="metric-strip">
            <div className="metric-item">
              <p className="metric-label">{t("statTotalExams")}</p>
              <p className="metric-value">{stats.total}</p>
              <p className="metric-note">{t("statTotalExamsNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("statAttempted")}</p>
              <p className="metric-value text-primary">{stats.primary}</p>
              <p className="metric-note">{t("statAttemptedStudentNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("statPassed")}</p>
              <p className="metric-value text-emerald-700 dark:text-emerald-300">{stats.passed}</p>
              <p className="metric-note">{t("statPassedStudentNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("statAverageScore")}</p>
              <p className="metric-value text-amber-700 dark:text-amber-300">
                {stats.primary > 0 ? `${stats.avg}%` : "—"}
              </p>
              <p className="metric-note">{t("statAverageScoreStudentNote")}</p>
            </div>
          </div>
        ) : (
          <div className="metric-strip">
            <div className="metric-item">
              <p className="metric-label">{t("statTotalExams")}</p>
              <p className="metric-value">{stats.total}</p>
              <p className="metric-note">{t("statTotalExamsNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("statAttempted")}</p>
              <p className="metric-value text-primary">{stats.primary}</p>
              <p className="metric-note">{t("statAttemptedStaffNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("statPassed")}</p>
              <p className="metric-value text-emerald-700 dark:text-emerald-300">{stats.passed}</p>
              <p className="metric-note">{t("statPassedStaffNote")}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">{t("statAverageScore")}</p>
              <p className="metric-value text-amber-700 dark:text-amber-300">
                {stats.primary > 0 ? `${stats.avg}%` : "—"}
              </p>
              <p className="metric-note">{t("statAverageScoreStaffNote")}</p>
            </div>
          </div>
        )}
      </section>

      {/* Main Section */}
      <section aria-labelledby="exams-list-title" className="space-y-4">
        <SectionHeader
          title={<span id="exams-list-title">{t("listTitle")}</span>}
          description={
            <span aria-live="polite">
              {t("resultsSummary", { shown: filteredExams.length, total: exams.length })}
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

        {/* Filter Toolbar */}
        <div className="filter-toolbar">
          <div className="flex flex-wrap items-center gap-2">
            {/* Role-Specific Filter Tabs */}
            {currentRole === "GAKUSEI" ? (
              <div
                role="group"
                aria-label={t("filterStatus")}
                className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60 overflow-x-auto"
              >
                <button
                  type="button"
                  aria-pressed={studentTab === "all"}
                  onClick={() => setStudentTab("all")}
                  className={cn(
                    "min-h-8 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    studentTab === "all"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("tabAll")}
                </button>
                <button
                  type="button"
                  aria-pressed={studentTab === "available"}
                  onClick={() => setStudentTab("available")}
                  className={cn(
                    "min-h-8 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    studentTab === "available"
                      ? "bg-primary/10 text-primary shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("tabAvailable")}
                </button>
                <button
                  type="button"
                  aria-pressed={studentTab === "completed"}
                  onClick={() => setStudentTab("completed")}
                  className={cn(
                    "min-h-8 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    studentTab === "completed"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("tabCompleted")}
                </button>
              </div>
            ) : (
              <div
                role="group"
                aria-label={t("filterStatus")}
                className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border/60 overflow-x-auto"
              >
                <button
                  type="button"
                  aria-pressed={staffTab === "all"}
                  onClick={() => setStaffTab("all")}
                  className={cn(
                    "min-h-8 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    staffTab === "all"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("tabAll")}
                </button>
                <button
                  type="button"
                  aria-pressed={staffTab === "ACTIVE"}
                  onClick={() => setStaffTab("ACTIVE")}
                  className={cn(
                    "min-h-8 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    staffTab === "ACTIVE"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("tabLifecycleActive")}
                </button>
                <button
                  type="button"
                  aria-pressed={staffTab === "UPCOMING"}
                  onClick={() => setStaffTab("UPCOMING")}
                  className={cn(
                    "min-h-8 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    staffTab === "UPCOMING"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("tabLifecycleUpcoming")}
                </button>
                <button
                  type="button"
                  aria-pressed={staffTab === "CLOSED"}
                  onClick={() => setStaffTab("CLOSED")}
                  className={cn(
                    "min-h-8 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    staffTab === "CLOSED"
                      ? "bg-muted-foreground/15 text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("tabLifecycleClosed")}
                </button>
              </div>
            )}

            {/* Cohort Select Filter */}
            <div className="flex items-center gap-1.5">
              <Filter aria-hidden="true" className="size-3.5 text-muted-foreground ml-1" />
              <select
                aria-label={t("filterCohort")}
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="h-9 rounded-lg border border-input bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">{t("allCohorts")}</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Bar */}
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

        {/* Exam Cards Grid or Empty State */}
        {filteredExams.length === 0 ? (
          hasActiveFilters ? (
            <EmptyState
              icon={<Award className="size-5" />}
              title={t("emptyFilteredTitle")}
              description={t("emptyFilteredDesc")}
              action={
                <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                  {t("resetFilters")}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<Award className="size-5" />}
              title={t("noExamsFound")}
              description={t("subtitle")}
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.map((exam) => {
              const cohort = cohorts.find((c) => c.id === exam.cohortId)
              const studentAttempt =
                currentRole === "GAKUSEI" && currentStudent
                  ? getStudentExamAttempt(exam.id, currentStudent.id)
                  : null
              const allAttempts = getExamAttempts(exam.id)
              const isCompleted = Boolean(studentAttempt)
              const isAvailable = exam.status === "ACTIVE" && !isCompleted

              return (
                <Card
                  key={exam.id}
                  className={cn(
                    "border-border/80 transition-all hover:shadow-sm flex flex-col justify-between",
                    isCompleted && "border-blue-500/30 bg-blue-50/5 dark:bg-blue-950/5"
                  )}
                >
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs font-bold">
                          {exam.targetLevel}
                        </Badge>
                        {cohort && (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {cohort.code}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1 text-[0.72rem] text-muted-foreground font-medium">
                          <Clock className="size-3" />
                          {t("durationBadge", { minutes: exam.durationMinutes })}
                        </span>
                        {canManage && (
                          <Badge
                            variant={
                              exam.status === "ACTIVE"
                                ? "success"
                                : exam.status === "UPCOMING"
                                ? "warning"
                                : "outline"
                            }
                            className="text-[0.68rem]"
                          >
                            {exam.status === "ACTIVE"
                              ? t("statusActive")
                              : exam.status === "UPCOMING"
                              ? t("statusUpcoming")
                              : t("statusClosed")}
                          </Badge>
                        )}
                      </div>

                      {/* Furigana badge */}
                      <span
                        className={cn(
                          "text-[0.68rem] px-2 py-0.5 rounded font-medium",
                          exam.allowFurigana
                            ? "bg-muted text-muted-foreground"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                        )}
                      >
                        {exam.allowFurigana ? t("furiganaEnabled") : t("furiganaDisabled")}
                      </span>
                    </div>

                    <div>
                      <CardTitle className="text-base font-bold hover:text-primary transition-colors leading-snug">
                        <Link href={`/exams/${exam.id}`}>{exam.title}</Link>
                      </CardTitle>
                      {exam.description && (
                        <CardDescription className="text-xs line-clamp-2 mt-1.5 leading-relaxed">
                          {exam.description}
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    {/* Metadata summary */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <span>{t("questionsCount", { count: exam.questions.length })}</span>
                      <span>{t("passThreshold", { score: exam.passScore })}</span>
                    </div>

                    {/* Student Attempt Status Banner */}
                    {currentRole === "GAKUSEI" && (
                      <div className="rounded-lg p-2.5 text-xs flex items-center justify-between bg-muted/40 border border-border/50">
                        {studentAttempt ? (
                          <>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={studentAttempt.passed ? "success" : "destructive"}
                                className="text-[0.68rem] font-bold"
                              >
                                {studentAttempt.passed ? t("statusPassed") : t("statusFailed")}
                              </Badge>
                              <span className="font-semibold text-foreground font-mono">
                                {studentAttempt.percentage}% ({studentAttempt.score}/{studentAttempt.maxScore})
                              </span>
                            </div>
                            <span className="text-[0.7rem] text-muted-foreground">
                              {studentAttempt.submittedAt}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock3 className="size-3.5 text-amber-500" />
                              <span>{t("statusNotAttempted")}</span>
                            </div>
                            <span
                              className={cn(
                                "text-[0.7rem] font-medium",
                                exam.status === "ACTIVE"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-muted-foreground"
                              )}
                            >
                              {exam.status === "ACTIVE"
                                ? t("tabAvailable")
                                : exam.status === "UPCOMING"
                                ? t("statusUpcoming")
                                : t("statusClosed")}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Teacher/Tantōsha Cohort Summary Banner */}
                    {canManage && (
                      <div className="rounded-lg p-2.5 text-xs flex items-center justify-between bg-muted/40 border border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {t("cohortParticipants", { count: allAttempts.length })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {t("cohortPassRate", {
                              rate:
                                allAttempts.length > 0
                                  ? `${Math.round((allAttempts.filter((a) => a.passed).length / allAttempts.length) * 100)}%`
                                  : "—",
                            })}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action CTA Button */}
                    <div className="pt-1">
                      {currentRole === "GAKUSEI" ? (
                        isCompleted ? (
                          <Link
                            href={`/exams/${exam.id}`}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-2 text-xs")}
                          >
                            <span>{t("viewResults")}</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        ) : isAvailable ? (
                          <Link
                            href={`/exams/${exam.id}`}
                            className={cn(buttonVariants({ size: "sm" }), "w-full gap-2 text-xs shadow-xs")}
                          >
                            <Award className="size-3.5" />
                            <span>{t("startExam")}</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/exams/${exam.id}`}
                            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-2 text-xs")}
                          >
                            <span>{t("viewResults")}</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        )
                      ) : (
                        <Link
                          href={`/exams/${exam.id}`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-2 text-xs")}
                        >
                          <span>{t("viewResults")}</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Create Exam Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg" closeLabel={tCommon("close")}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{t("createModalTitle")}</DialogTitle>
            <DialogDescription className="text-xs">{t("createModalDesc")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateExam} className="space-y-4 pt-2 text-xs">
            {formError && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-md bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2"
              >
                <AlertCircle className="size-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="create-exam-title" className="font-semibold text-foreground">
                {t("fieldTitle")}
              </label>
              <Input
                id="create-exam-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("placeholderTitle")}
                className="text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="create-exam-cohort" className="font-semibold text-foreground">
                  {t("fieldCohort")}
                </label>
                <select
                  id="create-exam-cohort"
                  value={cohortId}
                  onChange={(e) => setCohortId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-exam-level" className="font-semibold text-foreground">
                  {t("fieldLevel")}
                </label>
                <select
                  id="create-exam-level"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value as "N5")}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="N5">JLPT N5</option>
                  <option value="N4">JLPT N4</option>
                  <option value="N3">JLPT N3</option>
                  <option value="N2">JLPT N2</option>
                  <option value="N1">JLPT N1</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="create-exam-duration" className="font-semibold text-foreground">
                  {t("fieldDuration")}
                </label>
                <Input
                  id="create-exam-duration"
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-exam-pass-score" className="font-semibold text-foreground">
                  {t("fieldPassScore")}
                </label>
                <Input
                  id="create-exam-pass-score"
                  type="number"
                  min={10}
                  max={100}
                  value={passScore}
                  onChange={(e) => setPassScore(Number(e.target.value))}
                  className="text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="create-exam-furigana"
                checked={allowFurigana}
                onChange={(e) => setAllowFurigana(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              <label htmlFor="create-exam-furigana" className="font-medium text-foreground cursor-pointer text-xs">
                {t("fieldAllowFurigana")}
              </label>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="create-exam-description" className="font-semibold text-foreground">
                {t("fieldDescription")}
              </label>
              <Textarea
                id="create-exam-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("placeholderDescription")}
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-sans"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" size="sm">
                {t("saveExam")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
