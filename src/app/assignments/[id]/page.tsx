"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  CheckCircle2,
  AlertCircle,
  Award,
  BookOpen,
  Eye,
  EyeOff,
  Languages,
  Trash2,
  Edit3,
  Send,
  FileText,
  UserCheck,
  ArrowLeft,
  Clock,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
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
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { FuriganaText } from "@/components/ui/furigana-text"
import { StudentProfileDrawer } from "@/components/student-profile-drawer"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { EmptyState } from "@/components/ui/empty-state"
import { DestructiveConfirmDialog } from "@/components/ui/destructive-confirm-dialog"
import { useData } from "@/lib/data-context"
import { type AssignmentSubmission, type User } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string

  const t = useTranslations("assignmentDetail")
  const tAsg = useTranslations("assignments")
  const tCommon = useTranslations("common")
  const tNav = useTranslations("nav")

  const {
    assignments,
    cohorts,
    users,
    currentRole,
    deleteAssignment,
    submitAssignment,
    gradeSubmission,
    getAssignmentSubmissions,
    getStudentAssignmentSubmission,
    getCohortMembers,
  } = useData()

  const assignment = assignments.find((a) => a.id === assignmentId)
  const cohort = cohorts.find((c) => c.id === assignment?.cohortId)

  // Furigana & Translation controls
  const [showFurigana, setShowFurigana] = React.useState(true)
  const [showTranslation, setShowTranslation] = React.useState(false)

  // Student composition state
  const currentStudent = React.useMemo(() => {
    return users.find((u) => u.role === "GAKUSEI") || users[0]
  }, [users])

  const studentSub = React.useMemo(() => {
    if (!assignment || !currentStudent) return null
    return getStudentAssignmentSubmission(assignment.id, currentStudent.id)
  }, [assignment, currentStudent, getStudentAssignmentSubmission])

  const [draftText, setDraftText] = React.useState<string | null>(null)
  const compositionText = draftText ?? studentSub?.content ?? ""
  const setCompositionText = (text: string) => setDraftText(text)

  const [isEditing, setIsEditing] = React.useState(false)
  const [submitSuccess, setSubmitSuccess] = React.useState(false)
  const [confirmSubmitModal, setConfirmSubmitModal] = React.useState(false)

  // Destructive delete dialog state
  const [deleteConfirmModal, setDeleteConfirmModal] = React.useState(false)

  // Teacher grading modal state
  const [selectedSubForGrading, setSelectedSubForGrading] = React.useState<{
    student: User
    submission: AssignmentSubmission
  } | null>(null)
  const [gradeScore, setGradeScore] = React.useState<number>(85)
  const [gradeFeedback, setGradeFeedback] = React.useState("")
  const [gradingError, setGradingError] = React.useState("")

  // Student profile drill-down
  const [drilldownStudent, setDrilldownStudent] = React.useState<User | null>(null)

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"

  if (!assignment) {
    return (
      <PageShell>
        <EmptyState
          icon={<AlertCircle className="size-5 text-destructive" />}
          title={t("notFoundTitle")}
          description={t("notFoundDesc")}
          action={
            <Link
              href="/assignments"
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

  // Calculate cohort student roster for teachers
  const cohortMembers = cohort ? getCohortMembers(cohort.id) : { students: [] }
  const cohortStudents = cohortMembers.students
  const allSubmissions = getAssignmentSubmissions(assignment.id)
  const subMap = new Map<string, AssignmentSubmission>()
  allSubmissions.forEach((s) => subMap.set(s.studentId, s))

  const handleStudentSubmit = () => {
    if (!currentStudent || !compositionText.trim()) return
    submitAssignment(assignment.id, currentStudent.id, compositionText.trim())
    setSubmitSuccess(true)
    setIsEditing(false)
    setDraftText(null)
    setConfirmSubmitModal(false)
    setTimeout(() => setSubmitSuccess(false), 4000)
  }

  const handleOpenGrading = (student: User, submission: AssignmentSubmission) => {
    setSelectedSubForGrading({ student, submission })
    setGradeScore(submission.score ?? 85)
    setGradeFeedback(submission.feedback ?? "")
    setGradingError("")
  }

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubForGrading) return
    if (gradeScore < 0 || gradeScore > assignment.maxScore) {
      setGradingError(t("errorScoreRange", { max: assignment.maxScore }))
      return
    }
    if (!gradeFeedback.trim()) {
      setGradingError(t("errorFeedbackRequired"))
      return
    }

    gradeSubmission(
      selectedSubForGrading.submission.id,
      Number(gradeScore),
      gradeFeedback.trim(),
      "田中 晶子 (Tanaka Akiko)"
    )

    setSelectedSubForGrading(null)
  }

  const handleConfirmDelete = () => {
    deleteAssignment(assignment.id)
    setDeleteConfirmModal(false)
    router.push("/assignments")
  }

  return (
    <PageShell className="max-w-4xl pb-24">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: tNav("assignments"), href: "/assignments" },
          { label: assignment.title },
        ]}
      />

      {/* Page Header */}
      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {assignment.targetLevel}
            </Badge>
            {cohort && (
              <Link href={`/cohorts/${cohort.id}`}>
                <Badge variant="secondary" className="font-mono text-xs hover:bg-secondary/80 cursor-pointer">
                  {cohort.code} — {cohort.name}
                </Badge>
              </Link>
            )}
          </span>
        }
        title={assignment.title}
        description={assignment.description}
        metadata={
          <>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {t("dueCountdown", { date: assignment.dueDate })}
            </span>
            <span>{t("maxScoreLabel", { score: assignment.maxScore })}</span>
            <span>{t("passScoreLabel", { score: assignment.passScore })}</span>
          </>
        }
        action={
          canManage ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setDeleteConfirmModal(true)}
              className="gap-1.5 text-xs shadow-xs"
            >
              <Trash2 className="size-3.5" />
              <span>{t("deleteAssignment")}</span>
            </Button>
          ) : undefined
        }
      />

      {/* Japanese Prompt Card (With Furigana & Translation Toggles) */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <span>{t("promptTitle")}</span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={showFurigana ? "secondary" : "outline"}
              size="xs"
              aria-pressed={showFurigana}
              onClick={() => setShowFurigana(!showFurigana)}
              className="text-xs gap-1.5 h-7"
              title={t("furiganaTooltip")}
            >
              {showFurigana ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
              <span>{t("furiganaToggle", { status: showFurigana ? t("on") : t("off") })}</span>
            </Button>

            <Button
              type="button"
              variant={showTranslation ? "secondary" : "outline"}
              size="xs"
              aria-pressed={showTranslation}
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-xs gap-1.5 h-7"
              title={t("translationTooltip")}
            >
              <Languages className="size-3.5" />
              <span>{t("translationToggle", { status: showTranslation ? t("shown") : t("hidden") })}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          <div className="rounded-xl bg-muted/30 p-4 sm:p-5 border border-border/50 text-sm sm:text-base leading-relaxed whitespace-pre-line text-foreground font-sans">
            <FuriganaText text={assignment.japanesePrompt} showFurigana={showFurigana} />
          </div>

          {showTranslation && assignment.description && (
            <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 p-3 text-xs text-blue-800 dark:text-blue-300 border border-blue-500/20 flex items-start gap-2">
              <Languages className="size-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">{t("translationTitle")}</span>
                <span>{assignment.description}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* STUDENT WORKSPACE & SUBMISSION VIEW */}
      {currentRole === "GAKUSEI" && (
        <div className="space-y-6">
          {submitSuccess && (
            <div role="status" aria-live="polite" className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{t("submitSuccess")}</span>
            </div>
          )}

          {/* Graded Evaluation Card (if Graded) */}
          {studentSub?.status === "GRADED" && (
            <Card className="border-emerald-500/30 bg-emerald-50/15 dark:bg-emerald-950/10 shadow-xs">
              <CardHeader className="pb-3 border-b border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="size-5 text-emerald-600 dark:text-emerald-400" />
                    <CardTitle className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                      {t("evaluationTitle")}
                    </CardTitle>
                  </div>
                  <Badge
                    variant={studentSub.score! >= assignment.passScore ? "success" : "warning"}
                    className="text-xs px-2.5 py-0.5 font-bold font-mono"
                  >
                    {t("scoreInline", { score: studentSub.score || 0, max: assignment.maxScore })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-muted-foreground block mb-1">
                    {t("feedbackLabel")}
                  </span>
                  <div className="rounded-lg bg-background/80 p-3 border border-border/60 text-foreground whitespace-pre-line leading-relaxed">
                    {studentSub.feedback}
                  </div>
                </div>
                {studentSub.gradedBy && (
                  <p className="text-muted-foreground text-[0.72rem] text-right">
                    {t("gradedBy", { name: studentSub.gradedBy, date: studentSub.gradedAt || "" })}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submitted Composition Preview (When submitted and not editing) */}
          {studentSub && studentSub.status !== "PENDING" && !isEditing ? (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <CardTitle className="text-sm font-semibold">{t("statusSubmitted")}</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    {t("submittedAt", { date: studentSub.submittedAt || "" })}
                  </CardDescription>
                </div>

                {studentSub.status !== "GRADED" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setIsEditing(true)}
                    className="gap-1.5 text-xs self-start sm:self-auto"
                  >
                    <Edit3 className="size-3" />
                    <span>{t("editSubmission")}</span>
                  </Button>
                )}
              </CardHeader>

              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                  <span>{t("submissionWorkspace")}</span>
                  <span className="font-mono">{t("charCount", { count: studentSub.content.length })}</span>
                </div>
                <div className="rounded-xl bg-muted/20 p-4 border border-border/60 text-sm leading-relaxed whitespace-pre-line font-sans">
                  {studentSub.content}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Composition Writing Workspace */
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold">{t("submissionWorkspace")}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {t("charCountGuideline")}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {t("charCount", { count: compositionText.length })}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                <Textarea
                  id="student-composition-textarea"
                  aria-label={t("submissionWorkspace")}
                  rows={9}
                  value={compositionText}
                  onChange={(e) => setCompositionText(e.target.value)}
                  placeholder={t("textareaPlaceholder")}
                  className="w-full rounded-xl border border-input bg-background p-4 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring font-sans"
                />

                <div className="flex items-center justify-between pt-2">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setDraftText(null)
                      }}
                      className="text-xs"
                    >
                      {tCommon("cancel")}
                    </Button>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      disabled={compositionText.trim().length === 0}
                      onClick={() => setConfirmSubmitModal(true)}
                      className="gap-2 shadow-xs"
                    >
                      <Send className="size-3.5" />
                      <span>{t("submitAssignment")}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TEACHER / COORDINATOR VIEW: SUBMISSION ROSTER & GRADING */}
      {canManage && (
        <div className="space-y-4">
          <SectionHeader
            title={t("rosterTitle", { submitted: allSubmissions.length, total: cohortStudents.length })}
            description={t("rosterHint")}
          />

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <thead className="border-b border-border/60 bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4 text-left">{t("colStudent")}</th>
                    <th className="py-3 px-4 text-left">{t("colStatus")}</th>
                    <th className="py-3 px-4 text-left hidden sm:table-cell">{t("colSubmittedAt")}</th>
                    <th className="py-3 px-4 text-center">{t("colScore")}</th>
                    <th className="py-3 px-4 text-right">{t("colAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {cohortStudents.map((student) => {
                    const sub = subMap.get(student.id)
                    const isSubmitted = sub && (sub.status === "SUBMITTED" || sub.status === "GRADED")

                    return (
                      <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-7 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[0.7rem] shrink-0">
                              {student.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground text-xs">{student.name}</div>
                              <div className="text-[0.68rem] text-muted-foreground">{student.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {sub?.status === "GRADED" ? (
                            <Badge variant="success" className="text-[0.65rem] py-0 px-2 font-medium">
                              {tAsg("statusGraded", { score: sub.score || 0, max: assignment.maxScore })}
                            </Badge>
                          ) : sub?.status === "SUBMITTED" ? (
                            <Badge variant="secondary" className="text-[0.65rem] py-0 px-2 font-medium">
                              {tAsg("statusSubmitted")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[0.65rem] py-0 px-2 text-muted-foreground">
                              {t("notSubmitted")}
                            </Badge>
                          )}
                        </td>

                        <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground font-mono text-[0.7rem]">
                          {sub?.submittedAt || "—"}
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-xs">
                          {sub?.status === "GRADED" ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                              {sub.score}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="xs"
                              aria-label={`${tCommon("viewProgress")}: ${student.name}`}
                              onClick={() => setDrilldownStudent(student)}
                              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 gap-1"
                            >
                              <FileText className="size-3 text-indigo-500" />
                              <span>{tCommon("viewProgress")}</span>
                            </Button>

                            {isSubmitted ? (
                              <Button
                                type="button"
                                size="xs"
                                variant={sub.status === "GRADED" ? "outline" : "default"}
                                aria-label={sub.status === "GRADED" ? t("reviewActionForStudent", { name: student.name }) : t("gradeActionForStudent", { name: student.name })}
                                onClick={() => handleOpenGrading(student, sub)}
                                className="text-xs h-7 px-2.5 gap-1 shadow-xs"
                              >
                                <UserCheck className="size-3" />
                                <span>{sub.status === "GRADED" ? t("actionReview") : t("actionGrade")}</span>
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Student Submission */}
      <Dialog open={confirmSubmitModal} onOpenChange={setConfirmSubmitModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{t("submitAssignment")}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("submitConfirm")}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted/40 p-3 text-xs border border-border/50 max-h-40 overflow-y-auto whitespace-pre-line font-sans">
            {compositionText}
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmSubmitModal(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleStudentSubmit}
            >
              {t("submitAssignment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Teacher Grading Dialog */}
      <Dialog
        open={!!selectedSubForGrading}
        onOpenChange={(open) => !open && setSelectedSubForGrading(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{t("gradingModalTitle")}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("gradingModalDesc")}
            </DialogDescription>
          </DialogHeader>

          {selectedSubForGrading && (
            <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
              {gradingError && (
                <div role="alert" aria-live="polite" className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive border border-destructive/20">
                  {gradingError}
                </div>
              )}

              <div>
                <span className="block font-semibold mb-1 text-muted-foreground">
                  {t("studentComposition", { name: selectedSubForGrading.student.name })}
                </span>
                <div className="rounded-xl bg-muted/30 p-3.5 border border-border/60 max-h-48 overflow-y-auto text-xs leading-relaxed whitespace-pre-line font-sans">
                  {selectedSubForGrading.submission.content}
                </div>
                <div className="text-[0.68rem] text-muted-foreground mt-1 text-right font-mono">
                  {t("charCount", { count: selectedSubForGrading.submission.content.length })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="grading-score-input" className="block font-medium mb-1">
                    {t("inputScore", { max: assignment.maxScore })}
                  </label>
                  <Input
                    id="grading-score-input"
                    name="score"
                    type="number"
                    min={0}
                    max={assignment.maxScore}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="flex items-end pb-1 text-[0.72rem] text-muted-foreground">
                  <span>{t("passScoreInline", { score: assignment.passScore })}</span>
                </div>
              </div>

              <div>
                <label htmlFor="grading-feedback-input" className="block font-medium mb-1">
                  {t("inputFeedback")}
                </label>
                <Textarea
                  id="grading-feedback-input"
                  name="feedback"
                  rows={4}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder={t("feedbackPlaceholder")}
                  className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring font-sans"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSubForGrading(null)}
                >
                  {tCommon("cancel")}
                </Button>
                <Button type="submit" size="sm">
                  {t("submitGrade")}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Destructive Assignment Deletion Dialog */}
      <DestructiveConfirmDialog
        open={deleteConfirmModal}
        onOpenChange={setDeleteConfirmModal}
        title={t("deleteDialogTitle")}
        description={t("deleteDialogDesc", { title: assignment.title })}
        confirmLabel={t("deleteConfirmAction")}
        cancelLabel={tCommon("cancel")}
        closeLabel={tCommon("close")}
        onConfirm={handleConfirmDelete}
      />

      {/* Student Profile Overview Drawer */}
      <StudentProfileDrawer
        student={drilldownStudent}
        cohortId={assignment.cohortId}
        open={!!drilldownStudent}
        onOpenChange={(open) => !open && setDrilldownStudent(null)}
      />
    </PageShell>
  )
}
