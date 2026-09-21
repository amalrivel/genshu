"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Trash2,
  UserCheck,
  BookOpen,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { FuriganaText } from "@/components/ui/furigana-text"
import { StudentProfileDrawer } from "@/components/student-profile-drawer"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { EmptyState } from "@/components/ui/empty-state"
import { DestructiveConfirmDialog } from "@/components/ui/destructive-confirm-dialog"
import { useData } from "@/lib/data-context"
import { type ExamAttempt, type User } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function ExamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const t = useTranslations("examDetail")
  const tExams = useTranslations("exams")
  const tCommon = useTranslations("common")
  const tNav = useTranslations("nav")

  const {
    exams,
    cohorts,
    users,
    currentRole,
    deleteExam,
    submitExamAttempt,
    getExamAttempts,
    getStudentExamAttempt,
    getCohortMembers,
  } = useData()

  const exam = exams.find((e) => e.id === examId)
  const cohort = cohorts.find((c) => c.id === exam?.cohortId)

  const currentStudent = React.useMemo(() => {
    return users.find((u) => u.role === "GAKUSEI") || users[0]
  }, [users])

  // Existing attempt if already completed
  const studentAttempt = React.useMemo(() => {
    if (!exam || !currentStudent) return null
    return getStudentExamAttempt(exam.id, currentStudent.id)
  }, [exam, currentStudent, getStudentExamAttempt])

  // Active Exam Runner State
  const [examStarted, setExamStarted] = React.useState(false)
  const [isRetaking, setIsRetaking] = React.useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, number>>({})
  const [flaggedIds, setFlaggedIds] = React.useState<string[]>([])
  const [secondsRemaining, setSecondsRemaining] = React.useState(
    (exam?.durationMinutes || 30) * 60
  )

  // Modals & Drawers
  const [confirmSubmitModal, setConfirmSubmitModal] = React.useState(false)
  const [timeUpModal, setTimeUpModal] = React.useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [drilldownStudent, setDrilldownStudent] = React.useState<User | null>(null)

  // Submission guard and stable state refs for timeout auto-submit
  const hasSubmittedRef = React.useRef(false)
  const answersRef = React.useRef(answers)
  const flaggedIdsRef = React.useRef(flaggedIds)

  React.useEffect(() => {
    answersRef.current = answers
  }, [answers])

  React.useEffect(() => {
    flaggedIdsRef.current = flaggedIds
  }, [flaggedIds])

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"

  // Unified submission logic
  const executeSubmit = (
    submissionAnswers: Record<string, number>,
    submissionFlags: string[],
    timeSpentSecs: number
  ) => {
    if (hasSubmittedRef.current) return
    hasSubmittedRef.current = true
    if (!currentStudent || !exam) return

    submitExamAttempt(
      exam.id,
      currentStudent.id,
      submissionAnswers,
      submissionFlags,
      Math.max(1, timeSpentSecs)
    )
    setExamStarted(false)
    setIsRetaking(false)
    setConfirmSubmitModal(false)
  }

  const executeSubmitRef = React.useRef(executeSubmit)
  React.useEffect(() => {
    executeSubmitRef.current = executeSubmit
  })

  // Countdown Timer Hook (Safe against stale closures & strictly auto-submits on time up)
  React.useEffect(() => {
    const isRunning = examStarted && (!studentAttempt || isRetaking)
    if (!isRunning || !exam) return

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          // Critical Fix: Time is up -> Auto-submit captured state immediately!
          executeSubmitRef.current(
            answersRef.current,
            flaggedIdsRef.current,
            exam.durationMinutes * 60
          )
          setTimeUpModal(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [examStarted, studentAttempt, isRetaking, exam])

  if (!exam) {
    return (
      <PageShell>
        <EmptyState
          icon={<AlertCircle className="size-5 text-destructive" />}
          title={t("notFoundTitle")}
          description={t("notFoundDesc")}
          action={
            <Link
              href="/exams"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <ArrowLeft className="size-4" />
              {t("backToList")}
            </Link>
          }
        />
      </PageShell>
    )
  }

  const questions = exam.questions || []
  const currentQuestion = questions[currentQuestionIndex] || questions[0]
  const isFlagged = currentQuestion ? flaggedIds.includes(currentQuestion.id) : false

  // Format time (MM:SS)
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // Answer selection
  const handleSelectOption = (optIndex: number) => {
    if (!currentQuestion || !examStarted) return
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optIndex,
    }))
  }

  // Toggle flag for review
  const handleToggleFlag = () => {
    if (!currentQuestion || !examStarted) return
    setFlaggedIds((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    )
  }

  // Manual final submission confirmation handler
  const handleManualFinalSubmit = () => {
    const timeSpent = exam.durationMinutes * 60 - secondsRemaining
    executeSubmit(answers, flaggedIds, timeSpent)
  }

  // Teacher delete handler
  const handleDeleteExam = () => {
    deleteExam(exam.id)
    router.push("/exams")
  }

  // Retake initiation handler
  const handleStartRetake = () => {
    hasSubmittedRef.current = false
    setIsRetaking(true)
    setExamStarted(true)
    setSecondsRemaining(exam.durationMinutes * 60)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setFlaggedIds([])
  }

  // Teacher / Coordinator View Data
  const cohortMembers = cohort ? getCohortMembers(cohort.id) : { students: [] }
  const cohortStudents = cohortMembers.students
  const allAttempts = getExamAttempts(exam.id)
  const attemptMap = new Map<string, ExamAttempt>()
  allAttempts.forEach((a) => attemptMap.set(a.studentId, a))

  // Determine active student view workspace
  const isRunningActiveExam = examStarted && (!studentAttempt || isRetaking)
  const isShowingScorecard = Boolean(studentAttempt) && !isRetaking && !examStarted
  const isShowingBriefing = !isRunningActiveExam && !isShowingScorecard

  return (
    <PageShell>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs
        items={[
          { label: tNav("exams"), href: "/exams" },
          { label: exam.title },
        ]}
      />

      {/* Standard Page Header */}
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs font-bold">
              {exam.targetLevel}
            </Badge>
            {cohort && (
              <Link href={`/cohorts/${cohort.id}`}>
                <Badge variant="secondary" className="font-mono text-xs hover:bg-secondary/80">
                  {cohort.code} — {cohort.name}
                </Badge>
              </Link>
            )}
            <Badge
              variant={exam.allowFurigana ? "secondary" : "outline"}
              className="text-xs"
            >
              {exam.allowFurigana ? tExams("furiganaEnabled") : tExams("furiganaDisabled")}
            </Badge>
            {canManage && (
              <Badge
                variant={
                  exam.status === "ACTIVE"
                    ? "success"
                    : exam.status === "UPCOMING"
                    ? "warning"
                    : "outline"
                }
                className="text-xs"
              >
                {exam.status === "ACTIVE"
                  ? tExams("statusActive")
                  : exam.status === "UPCOMING"
                  ? tExams("statusUpcoming")
                  : tExams("statusClosed")}
              </Badge>
            )}
          </span>
        }
        title={exam.title}
        description={exam.description}
        metadata={
          <>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              <span>{t("minutes", { minutes: exam.durationMinutes })}</span>
            </span>
            <span>•</span>
            <span>{t("questions", { count: questions.length })}</span>
            <span>•</span>
            <span>{t("passCriteria", { score: exam.passScore })}</span>
          </>
        }
        action={
          canManage ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="gap-1.5 text-xs shadow-xs"
            >
              <Trash2 className="size-3.5" />
              <span>{t("deleteExam")}</span>
            </Button>
          ) : undefined
        }
      />

      {/* ========================================================================= */}
      {/* TEACHER / COORDINATOR VIEW: COHORT RESULTS LEADERBOARD                   */}
      {/* ========================================================================= */}
      {canManage && (
        <section aria-labelledby="cohort-results-title" className="space-y-6">
          <h2 id="cohort-results-title" className="sr-only">
            {t("cohortStatsTitle")}
          </h2>

          {/* Cohort Stats Metric Strip */}
          <div className="metric-strip">
            <div className="metric-item">
              <p className="metric-label">{t("statParticipants")}</p>
              <p className="metric-value font-mono">
                {allAttempts.length} / {cohortStudents.length}
              </p>
              <p className="metric-note">{t("statParticipantsNote")}</p>
            </div>

            <div className="metric-item">
              <p className="metric-label">{t("statPassRate")}</p>
              <p className="metric-value font-mono text-emerald-700 dark:text-emerald-300">
                {allAttempts.length > 0
                  ? `${Math.round((allAttempts.filter((a) => a.passed).length / allAttempts.length) * 100)}%`
                  : "0%"}
              </p>
              <p className="metric-note">
                {t("statPassRateNote", {
                  count: allAttempts.filter((a) => a.passed).length,
                })}
              </p>
            </div>

            <div className="metric-item">
              <p className="metric-label">{t("statCohortAvg")}</p>
              <p className="metric-value font-mono text-amber-700 dark:text-amber-300">
                {allAttempts.length > 0
                  ? `${Math.round(allAttempts.reduce((s, a) => s + a.percentage, 0) / allAttempts.length)}%`
                  : "—"}
              </p>
              <p className="metric-note">{t("statCohortAvgNote", { score: exam.passScore })}</p>
            </div>
          </div>

          {/* Leaderboard Table Card */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="size-5 text-amber-500" />
                <span>{t("leaderboardTitle")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th scope="col" className="py-3 px-4 text-left">
                        {t("colStudent")}
                      </th>
                      <th scope="col" className="py-3 px-4 text-left">
                        {t("colScore")}
                      </th>
                      <th scope="col" className="py-3 px-4 text-left">
                        {t("colStatus")}
                      </th>
                      <th scope="col" className="py-3 px-4 text-left">
                        {t("colTime")}
                      </th>
                      <th scope="col" className="py-3 px-4 text-left">
                        {t("colDate")}
                      </th>
                      <th scope="col" className="py-3 px-4 text-right">
                        {tCommon("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {cohortStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          {t("noAttemptsYet")}
                        </td>
                      </tr>
                    ) : (
                      cohortStudents.map((student) => {
                        const att = attemptMap.get(student.id)
                        return (
                          <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-medium">
                              <div className="font-semibold text-foreground">{student.name}</div>
                              {student.japaneseName && (
                                <div className="text-[0.7rem] text-muted-foreground font-sans">
                                  {student.japaneseName}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold">
                              {att ? `${att.score} / ${att.maxScore} (${att.percentage}%)` : "—"}
                            </td>
                            <td className="py-3 px-4">
                              {att ? (
                                <Badge
                                  variant={att.passed ? "success" : "destructive"}
                                  className="text-[0.68rem] font-bold"
                                >
                                  {att.passed ? tExams("statusPassed") : tExams("statusFailed")}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-[0.7rem]">
                                  {tExams("statusNotAttempted")}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground font-mono">
                              {att
                                ? `${Math.floor(att.timeSpentSeconds / 60)}m ${att.timeSpentSeconds % 60}s`
                                : "—"}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {att ? att.submittedAt : "—"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="xs"
                                onClick={() => setDrilldownStudent(student)}
                                aria-label={t("viewStudentProgress", { name: student.name })}
                                className="text-xs text-primary hover:text-primary gap-1"
                              >
                                <UserCheck className="size-3" />
                                <span>{tCommon("viewProgress")}</span>
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ========================================================================= */}
      {/* STUDENT PERSPECTIVE: 3 WORKSPACES                                        */}
      {/* ========================================================================= */}
      {currentRole === "GAKUSEI" && (
        <div className="space-y-6">
          {/* CASE 1: PRE-EXAM BRIEFING (Not yet started, not yet submitted) */}
          {isShowingBriefing && (
            <Card className="border-border/80 shadow-xs max-w-3xl mx-auto">
              <CardHeader className="text-center pb-2">
                <div className="size-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-2">
                  <Award className="size-6" />
                </div>
                <CardTitle className="text-lg font-bold">{t("briefingTitle")}</CardTitle>
                <CardDescription className="text-xs">{t("briefingNotice")}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 pt-4 text-xs">
                <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Clock className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{t("ruleTimer")}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{t("ruleScoring")}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Award className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{t("ruleIntegrity")}</span>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      hasSubmittedRef.current = false
                      setExamStarted(true)
                      setSecondsRemaining(exam.durationMinutes * 60)
                      setCurrentQuestionIndex(0)
                      setAnswers({})
                      setFlaggedIds([])
                    }}
                    className="gap-2 shadow-xs px-8 font-bold"
                  >
                    <Award className="size-4" />
                    <span>{t("btnBeginExam")}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CASE 2: ACTIVE TIMED EXAMINATION ROOM */}
          {isRunningActiveExam && (
            <div className="space-y-6">
              {/* Sticky Top Bar: Countdown Timer & Question Tracker */}
              <div className="sticky top-16 z-30 rounded-xl border border-border/80 bg-background/95 backdrop-blur-md p-3 sm:p-4 shadow-sm flex items-center justify-between gap-3">
                <div
                  role="progressbar"
                  aria-label={t("progressBarLabel")}
                  aria-valuenow={currentQuestionIndex + 1}
                  aria-valuemin={1}
                  aria-valuemax={questions.length}
                  className="flex items-center gap-2"
                >
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {t("questionProgress", {
                      current: currentQuestionIndex + 1,
                      total: questions.length,
                    })}
                  </Badge>
                  {isFlagged && (
                    <Badge variant="warning" className="text-[0.68rem] gap-1">
                      <Flag className="size-3 fill-amber-500 text-amber-500" />
                      <span>{t("paletteFlagged")}</span>
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div
                    aria-label={t("timerAriaLabel")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono font-bold text-sm tracking-wider transition-colors",
                      secondsRemaining <= 60
                        ? "bg-destructive/15 text-destructive animate-pulse"
                        : secondsRemaining <= 300
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <Clock className="size-4" aria-hidden="true" />
                    <span>{formatTimer(secondsRemaining)}</span>
                  </div>

                  <Button
                    type="button"
                    size="xs"
                    onClick={() => setConfirmSubmitModal(true)}
                    className="text-xs font-semibold shadow-xs"
                  >
                    {t("btnFinishExam")}
                  </Button>
                </div>
              </div>

              {/* Main Examination Layout: Question Palette Grid (Left) + Question Card (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Palette Grid */}
                <Card className="border-border/80 shadow-xs lg:col-span-1 h-fit">
                  <CardHeader className="pb-3 border-b border-border/60">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("questionPalette")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                      {questions.map((q, idx) => {
                        const isAns = answers[q.id] !== undefined
                        const isFlg = flaggedIds.includes(q.id)
                        const isCurrent = idx === currentQuestionIndex

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentQuestionIndex(idx)}
                            aria-current={isCurrent ? "step" : undefined}
                            aria-label={t("questionAriaLabel", {
                              number: idx + 1,
                              status: isAns ? t("answered") : t("unanswered"),
                              flagged: isFlg ? t("flagged") : t("unflagged"),
                            })}
                            className={cn(
                              "h-9 w-full rounded-md flex items-center justify-center font-mono text-xs font-bold transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                              isAns
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "border border-border text-foreground hover:bg-muted",
                              isFlg &&
                                "after:absolute after:top-1 after:right-1 after:size-2 after:rounded-full after:bg-amber-500"
                            )}
                          >
                            {idx + 1}
                          </button>
                        )
                      })}
                    </div>

                    {/* Palette Legend */}
                    <div className="space-y-1.5 text-[0.7rem] text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded bg-primary" />
                        <span>{t("paletteAnswered")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded border border-border bg-background" />
                        <span>{t("paletteUnanswered")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-amber-500" />
                        <span>{t("paletteFlagged")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Question Workspace */}
                <div className="lg:col-span-3 space-y-4">
                  <Card className="border-border/80 shadow-xs">
                    <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("questionProgress", {
                          current: currentQuestionIndex + 1,
                          total: questions.length,
                        })}
                      </span>

                      <Button
                        type="button"
                        variant={isFlagged ? "secondary" : "outline"}
                        size="xs"
                        aria-pressed={isFlagged}
                        onClick={handleToggleFlag}
                        className={cn(
                          "gap-1.5 text-xs h-7",
                          isFlagged && "text-amber-600 dark:text-amber-400 border-amber-500/40"
                        )}
                      >
                        <Flag className={cn("size-3", isFlagged && "fill-amber-500 text-amber-500")} />
                        <span>{isFlagged ? t("unflagButton") : t("flagButton")}</span>
                      </Button>
                    </CardHeader>

                    <CardContent className="pt-5 space-y-6">
                      {/* Japanese Question Prompt */}
                      <div className="text-base sm:text-lg font-medium leading-loose text-foreground whitespace-pre-line font-sans">
                        <FuriganaText
                          html={currentQuestion.prompt}
                          showFurigana={exam.allowFurigana}
                        />
                      </div>

                      {/* Multiple Choice Options */}
                      <div className="space-y-2.5 pt-2">
                        {currentQuestion.options.map((opt, optIdx) => {
                          const isSelected = answers[currentQuestion.id] === optIdx
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => handleSelectOption(optIdx)}
                              className={cn(
                                "w-full text-left rounded-xl p-3 sm:p-4 border transition-all text-xs sm:text-sm font-sans flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                isSelected
                                  ? "border-primary bg-primary/10 text-foreground font-semibold ring-1 ring-primary"
                                  : "border-border/80 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    "size-6 rounded-full flex items-center justify-center font-mono text-xs font-bold border",
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "border-border/80 text-muted-foreground"
                                  )}
                                >
                                  {["A", "B", "C", "D"][optIdx] || optIdx + 1}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isSelected && <Check className="size-4 text-primary" />}
                            </button>
                          )
                        })}
                      </div>

                      {/* Question Navigation Controls */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={currentQuestionIndex === 0}
                          onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                          className="gap-1 text-xs"
                        >
                          <ArrowLeft className="size-3.5" />
                          <span>{t("btnPrevious")}</span>
                        </Button>

                        {currentQuestionIndex < questions.length - 1 ? (
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() =>
                              setCurrentQuestionIndex((prev) =>
                                Math.min(questions.length - 1, prev + 1)
                              )
                            }
                            className="gap-1 text-xs shadow-xs"
                          >
                            <span>{t("btnNext")}</span>
                            <ArrowRight className="size-3.5" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => setConfirmSubmitModal(true)}
                            className="gap-1 text-xs shadow-xs"
                          >
                            <span>{t("btnFinishExam")}</span>
                            <Check className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* CASE 3: POST-EXAM SCORECARD & QUESTION REVIEW */}
          {isShowingScorecard && studentAttempt && (
            <div className="space-y-6">
              {/* Scorecard Banner */}
              <Card
                className={cn(
                  "border shadow-xs",
                  studentAttempt.passed
                    ? "border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20"
                    : "border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/20"
                )}
              >
                <CardHeader className="text-center pb-2">
                  <div
                    className={cn(
                      "size-14 rounded-full mx-auto flex items-center justify-center mb-2",
                      studentAttempt.passed
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {studentAttempt.passed ? (
                      <CheckCircle2 className="size-8" />
                    ) : (
                      <AlertCircle className="size-8" />
                    )}
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-black">
                    {studentAttempt.passed ? t("passResult") : t("failResult")}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm font-medium">
                    {t("scorecardPoints", {
                      score: studentAttempt.score,
                      maxScore: studentAttempt.maxScore,
                      percentage: studentAttempt.percentage,
                    })}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2 text-center space-y-4">
                  <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                    <span>
                      {t("timeSpent", {
                        time: `${Math.floor(studentAttempt.timeSpentSeconds / 60)}m ${studentAttempt.timeSpentSeconds % 60}s`,
                      })}
                    </span>
                    <span>•</span>
                    <span>{t("submittedOn", { date: studentAttempt.submittedAt })}</span>
                    <span>•</span>
                    <span>{t("passThresholdLabel", { score: exam.passScore })}</span>
                  </div>

                  <div className="pt-1 flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleStartRetake}
                      className="gap-2 text-xs shadow-xs"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>{tExams("retakeExam")}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Comprehensive Question Review Mode */}
              <div className="space-y-4">
                <SectionHeader
                  title={
                    <span className="flex items-center gap-2">
                      <BookOpen className="size-4 text-primary" />
                      <span>{t("reviewModeTitle")}</span>
                    </span>
                  }
                />

                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const studentAns = studentAttempt.answers[q.id]
                    const isCorrect = studentAns === q.correctAnswerIndex

                    return (
                      <Card
                        key={q.id}
                        className={cn(
                          "border shadow-xs",
                          isCorrect ? "border-border/80" : "border-destructive/40 bg-destructive/5"
                        )}
                      >
                        <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-muted-foreground">
                              #{idx + 1}
                            </span>
                            <Badge
                              variant={isCorrect ? "success" : "destructive"}
                              className="text-[0.68rem] font-bold"
                            >
                              {isCorrect
                                ? t("correctBadge", { points: q.points || 20 })
                                : t("incorrectBadge")}
                            </Badge>
                          </div>

                          <span className="text-[0.7rem] text-muted-foreground font-mono">
                            {t("pointsLabel", { points: q.points || 20 })}
                          </span>
                        </CardHeader>

                        <CardContent className="pt-4 space-y-4 text-xs">
                          {/* Question Prompt */}
                          <div className="text-sm font-medium leading-relaxed font-sans text-foreground whitespace-pre-line">
                            <FuriganaText html={q.prompt} showFurigana={true} />
                          </div>

                          {/* Options List */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {q.options.map((opt, oIdx) => {
                              const wasSelected = studentAns === oIdx
                              const isTheCorrectOne = q.correctAnswerIndex === oIdx

                              return (
                                <div
                                  key={oIdx}
                                  className={cn(
                                    "p-3 rounded-lg border text-xs flex items-center justify-between gap-2",
                                    isTheCorrectOne &&
                                      "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold",
                                    wasSelected &&
                                      !isTheCorrectOne &&
                                      "border-destructive bg-destructive/10 text-destructive font-semibold",
                                    !wasSelected &&
                                      !isTheCorrectOne &&
                                      "border-border/60 text-muted-foreground"
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono font-bold shrink-0">
                                      {["A", "B", "C", "D"][oIdx] || oIdx + 1}.
                                    </span>
                                    <span className="truncate">{opt}</span>
                                  </div>
                                  {isTheCorrectOne && (
                                    <Badge variant="success" className="text-[0.62rem] py-0 shrink-0">
                                      {t("answerKey")}
                                    </Badge>
                                  )}
                                  {wasSelected && !isTheCorrectOne && (
                                    <Badge variant="destructive" className="text-[0.62rem] py-0 shrink-0">
                                      {t("yourChoice")}
                                    </Badge>
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          {/* Explanations */}
                          <div className="rounded-lg bg-muted/40 p-3 border border-border/60 space-y-1.5 leading-relaxed">
                            <div className="font-semibold text-foreground text-[0.75rem]">
                              {t("explanation")}
                            </div>
                            <p className="text-muted-foreground">{q.explanationJa}</p>
                            {q.explanationId && (
                              <p className="text-[0.7rem] text-muted-foreground/90 border-t border-border/40 pt-1">
                                {q.explanationId}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Audit Modal Before Submit */}
      <Dialog open={confirmSubmitModal} onOpenChange={setConfirmSubmitModal}>
        <DialogContent className="sm:max-w-md" closeLabel={tCommon("close")}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{t("submitAuditTitle")}</DialogTitle>
            <DialogDescription className="text-xs">{t("auditReadyNotice")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-lg bg-muted/50 p-3 space-y-2 border border-border">
              <div className="flex items-center justify-between">
                <span>{t("paletteAnswered")}:</span>
                <span className="font-mono font-bold">
                  {Object.keys(answers).length} / {questions.length}
                </span>
              </div>

              {flaggedIds.length > 0 && (
                <div className="rounded-md bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300 flex items-center gap-2 font-medium">
                  <Flag className="size-3.5 fill-amber-500 text-amber-500 shrink-0" />
                  <span>{t("auditFlaggedWarning", { count: flaggedIds.length })}</span>
                </div>
              )}

              {Object.keys(answers).length < questions.length && (
                <div className="rounded-md bg-destructive/10 p-2 text-destructive flex items-center gap-2 font-medium">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>
                    {t("auditUnansweredWarning", {
                      count: questions.length - Object.keys(answers).length,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmSubmitModal(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="button" size="sm" onClick={handleManualFinalSubmit}>
              {t("confirmSubmit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Up Auto-Submitted Notification Modal */}
      <Dialog open={timeUpModal} onOpenChange={setTimeUpModal}>
        <DialogContent className="sm:max-w-md" closeLabel={tCommon("close")}>
          <DialogHeader>
            <div className="size-10 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center mb-1">
              <Clock className="size-5" />
            </div>
            <DialogTitle className="text-center font-bold">{t("timeUpTitle")}</DialogTitle>
            <DialogDescription className="text-center text-xs">
              {t("timeUpDesc")}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2 sm:justify-center">
            <Button
              type="button"
              size="sm"
              onClick={() => setTimeUpModal(false)}
              className="font-bold"
            >
              {t("btnSeeResults")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teacher Destructive Exam Deletion Dialog */}
      <DestructiveConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t("deleteDialogTitle")}
        description={t("deleteDialogDesc", { title: exam.title })}
        confirmLabel={t("deleteConfirmAction")}
        cancelLabel={tCommon("cancel")}
        closeLabel={tCommon("close")}
        onConfirm={handleDeleteExam}
      />

      {/* Student Profile Overview Drilldown Drawer */}
      <StudentProfileDrawer
        student={drilldownStudent}
        open={Boolean(drilldownStudent)}
        onOpenChange={(open) => {
          if (!open) setDrilldownStudent(null)
        }}
        cohortId={cohort?.id}
      />
    </PageShell>
  )
}
