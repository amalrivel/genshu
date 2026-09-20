"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  Layers,
  FileCheck2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useData } from "@/lib/data-context"
import { type User } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface StudentProfileDrawerProps {
  student: User | null
  cohortId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentProfileDrawer({
  student,
  cohortId,
  open,
  onOpenChange,
}: StudentProfileDrawerProps) {
  const t = useTranslations("studentProfile")
  const tAtt = useTranslations("attendance")
  const tCommon = useTranslations("common")

  const {
    getUserCohorts,
    getStudentAttendanceSummary,
    getStudentPracticeSummary,
    getStudentAssignmentSummary,
    getStudentExamSummary,
  } = useData()

  if (!student) return null

  const userCohorts = getUserCohorts(student.id)
  const attSummary = getStudentAttendanceSummary(student.id, cohortId)
  const practiceSummary = getStudentPracticeSummary(student.id)
  const assignmentSummary = getStudentAssignmentSummary(student.id)
  const examSummary = getStudentExamSummary(student.id)

  const isPassingAttendance = attSummary.rate >= 90
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <DialogHeader className="border-b border-border/70 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-base shadow-xs shrink-0">
                {initials}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {student.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {student.japaneseName ? `${student.japaneseName} • ` : ""}
                  {student.email}
                </DialogDescription>
              </div>
            </div>

            <Badge variant="roleGakusei" className="text-xs shrink-0">
              <GraduationCap className="h-3 w-3 mr-1" />
              {tCommon("roleGakusei")}
            </Badge>
          </div>

          {/* Enrolled Cohorts Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3">
            <span className="text-[0.7rem] font-medium text-muted-foreground flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {t("cohortsEnrolled")}:
            </span>
            {userCohorts.length === 0 ? (
              <span className="text-[0.7rem] text-muted-foreground italic">
                {tCommon("all")}
              </span>
            ) : (
              userCohorts.map((c) => (
                <Link
                  key={c.id}
                  href={`/cohorts/${c.id}`}
                  onClick={() => onOpenChange(false)}
                >
                  <Badge
                    variant="outline"
                    className="text-[0.7rem] py-0 px-2 font-mono hover:bg-muted transition-colors cursor-pointer"
                  >
                    {c.code}
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </DialogHeader>

        {/* Attendance Compliance Section */}
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {t("attendanceOverview")}
              </h4>
              <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                {t("excusedNote")}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-2xl font-bold tracking-tight">
                {attSummary.rate}%
              </span>
              <Badge
                variant={isPassingAttendance ? "success" : "destructive"}
                className="text-[0.7rem] gap-1 py-0.5"
              >
                {isPassingAttendance ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {isPassingAttendance
                  ? t("targetReached")
                  : t("targetWarning")}
              </Badge>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isPassingAttendance
                    ? "bg-emerald-500"
                    : "bg-amber-500 dark:bg-amber-400"
                )}
                style={{ width: `${Math.min(attSummary.rate, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[0.68rem] text-muted-foreground">
              <span>0%</span>
              <span className="font-semibold text-foreground/80">
                {t("targetRateLabel")}
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* 4-State Count Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
              <p className="text-[0.68rem] font-medium text-emerald-600 dark:text-emerald-400">
                {tAtt("present")}
              </p>
              <p className="mt-0.5 text-lg font-bold">{attSummary.present}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
              <p className="text-[0.68rem] font-medium text-amber-600 dark:text-amber-400">
                {tAtt("late")}
              </p>
              <p className="mt-0.5 text-lg font-bold">{attSummary.late}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
              <p className="text-[0.68rem] font-medium text-rose-600 dark:text-rose-400">
                {tAtt("absent")}
              </p>
              <p className="mt-0.5 text-lg font-bold">{attSummary.absent}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5 text-center">
              <p className="text-[0.68rem] font-medium text-sky-600 dark:text-sky-400">
                {tAtt("excused")}
              </p>
              <p className="mt-0.5 text-lg font-bold">{attSummary.excused}</p>
            </div>
          </div>

          {/* Recent 5 Sessions */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {t("recentSessions")}
            </p>

            {attSummary.recentRecords.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                {t("noAttendanceHistory")}
              </p>
            ) : (
              <div className="space-y-1.5">
                {attSummary.recentRecords.map(({ session, record }) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-border/50 bg-background/50 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground text-[0.7rem]">
                          {session.date}
                        </span>
                        <span className="font-medium text-foreground truncate">
                          {session.lessonTitle}
                        </span>
                      </div>
                      {record.note && (
                        <p className="text-[0.68rem] text-muted-foreground italic mt-0.5">
                          {record.note}
                        </p>
                      )}
                    </div>

                    <Badge
                      variant={
                        record.status === "PRESENT"
                          ? "success"
                          : record.status === "LATE"
                          ? "warning"
                          : record.status === "ABSENT"
                          ? "destructive"
                          : "info"
                      }
                      className="text-[0.68rem] py-0 px-2 shrink-0 self-start sm:self-center"
                    >
                      {record.status === "PRESENT" && tAtt("present")}
                      {record.status === "LATE" && tAtt("late")}
                      {record.status === "ABSENT" && tAtt("absent")}
                      {record.status === "EXCUSED" && tAtt("excused")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* JLPT Practice Performance Section */}
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold tracking-tight flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {t("practiceOverview")}
            </h4>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
              <p className="text-[0.68rem] font-medium text-muted-foreground">
                {t("totalAttempts")}
              </p>
              <p className="mt-1 text-xl font-bold">
                {practiceSummary.totalAttempts}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
              <p className="text-[0.68rem] font-medium text-muted-foreground">
                {t("averageScore")}
              </p>
              <p className="mt-1 text-xl font-bold text-primary">
                {practiceSummary.averageScore}%
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-center">
              <p className="text-[0.68rem] font-medium text-muted-foreground">
                {t("passedAttempts")}
              </p>
              <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {practiceSummary.passedCount}
              </p>
            </div>
          </div>

          {/* Recent 5 Practice Attempts */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Award className="h-3 w-3" />
              {t("recentPractice")}
            </p>

            {practiceSummary.recentAttempts.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                {t("noPracticeHistory")}
              </p>
            ) : (
              <div className="space-y-1.5">
                {practiceSummary.recentAttempts.map(({ attempt, set }) => {
                  const passScore = set?.passScore ?? 70
                  const isPassed = attempt.score >= passScore

                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/50 bg-background/50 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">
                            {set?.title || tCommon("details")}
                          </span>
                          {set?.targetLevel && (
                            <Badge
                              variant="outline"
                              className="text-[0.65rem] py-0 px-1 font-mono"
                            >
                              {set.targetLevel}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[0.68rem] text-muted-foreground">
                          {attempt.completedAt.split("T")[0]}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-sm">
                          {attempt.score}%
                        </span>
                        <Badge
                          variant={isPassed ? "success" : "secondary"}
                          className="text-[0.68rem] py-0 px-2"
                        >
                          {isPassed ? t("passedBadge") : t("failedBadge")}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Assignments Performance Section */}
        <div className="space-y-3.5 border-t border-border/70 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-purple-500" />
              <span>{t("assignmentsOverview")}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              {assignmentSummary.submittedCount}/{assignmentSummary.totalAssigned} Selesai
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[0.68rem] text-muted-foreground block">{t("totalAssigned")}</span>
              <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                {assignmentSummary.totalAssigned}
              </span>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[0.68rem] text-muted-foreground block">{t("submittedAssignments")}</span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {assignmentSummary.submittedCount}
              </span>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[0.68rem] text-muted-foreground block">{t("averageScore")}</span>
              <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                {assignmentSummary.averageScore > 0 ? `${assignmentSummary.averageScore} pts` : "—"}
              </span>
            </div>
          </div>

          {/* Recent Submissions List */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground block">
              {t("recentAssignments")}
            </span>

            {assignmentSummary.submissions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2 text-center">
                {t("noAssignmentsHistory")}
              </p>
            ) : (
              <div className="space-y-2">
                {assignmentSummary.submissions.slice(0, 3).map(({ assignment: asg, submission: sub }) => {
                  return (
                    <div
                      key={asg.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/50 bg-background/50 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">
                            {asg.title}
                          </span>
                          <Badge variant="outline" className="text-[0.65rem] py-0 px-1 font-mono">
                            {asg.targetLevel}
                          </Badge>
                        </div>
                        <span className="text-[0.68rem] text-muted-foreground">
                          {asg.dueDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {sub?.status === "GRADED" ? (
                          <>
                            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                              {sub.score} pts
                            </span>
                            <Badge variant="success" className="text-[0.68rem] py-0 px-2">
                              {t("passedBadge")}
                            </Badge>
                          </>
                        ) : sub?.status === "SUBMITTED" ? (
                          <Badge variant="secondary" className="text-[0.68rem] py-0 px-2">
                            {t("submittedAssignments")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[0.68rem] py-0 px-2 text-muted-foreground">
                            {t("pendingAssignments")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Exams Performance Section */}
        <div className="space-y-3.5 border-t border-border/70 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>{t("examsOverview")}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              {examSummary.passedCount}/{examSummary.totalExams}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[0.68rem] text-muted-foreground block">{t("totalExams")}</span>
              <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                {examSummary.totalExams}
              </span>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[0.68rem] text-muted-foreground block">{t("passedExams")}</span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {examSummary.passedCount}
              </span>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
              <span className="text-[0.68rem] text-muted-foreground block">{t("averageExamScore")}</span>
              <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                {examSummary.totalExams > 0 ? `${examSummary.averagePercentage}%` : "—"}
              </span>
            </div>
          </div>

          {/* Recent Exam Attempts */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground block">
              {t("recentExams")}
            </span>

            {examSummary.recentAttempts.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2 text-center">
                {t("noExamsHistory")}
              </p>
            ) : (
              <div className="space-y-2">
                {examSummary.recentAttempts.slice(0, 3).map(({ exam, attempt }) => {
                  const isPassed = attempt.percentage >= exam.passScore
                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/50 bg-background/50 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">
                            {exam.title}
                          </span>
                          <Badge variant="outline" className="text-[0.65rem] py-0 px-1 font-mono">
                            {exam.targetLevel}
                          </Badge>
                        </div>
                        <span className="text-[0.68rem] text-muted-foreground">
                          {attempt.submittedAt?.split("T")[0] ?? attempt.submittedAt?.split(" ")[0] ?? "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-sm">
                          {attempt.percentage}%
                        </span>
                        <Badge
                          variant={isPassed ? "success" : "secondary"}
                          className="text-[0.68rem] py-0 px-2"
                        >
                          {isPassed ? t("passedBadge") : t("failedBadge")}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs"
          >
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
