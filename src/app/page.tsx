"use client"

import Link from "next/link"
import {
  ArrowRight,
  Award,
  CalendarCheck,
  CheckSquare,
  FileCheck2,
  GraduationCap,
  Layers,
  Users,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { EmptyState } from "@/components/ui/empty-state"
import { useData } from "@/lib/data-context"
import { type UserRole } from "@/lib/mock-data"

export default function Home() {
  const { cohorts, users, assignments, exams, attendanceSessions, practiceSets, currentRole, getAssignmentSubmissions, getStudentAssignmentSubmission, getStudentExamAttempt, getBestAttempt, getStudentAttendanceStats } = useData()
  const t = useTranslations("dashboard")
  const tCommon = useTranslations("common")

  const students = users.filter((user) => user.role === "GAKUSEI")
  const activeCohorts = cohorts.filter((cohort) => cohort.status === "active")
  const currentStudent = students[0]
  const studentId = currentStudent?.id || "user-g1"
  const studentPendingAssignments = assignments.filter((assignment) => {
    const submission = getStudentAssignmentSubmission(assignment.id, studentId)
    return !submission || submission.status === "PENDING"
  })
  const submissionsToReview = assignments.reduce(
    (count, assignment) => count + getAssignmentSubmissions(assignment.id).filter((submission) => submission.status === "SUBMITTED").length,
    0
  )
  const studentCompletedExams = exams.filter((exam) => getStudentExamAttempt(exam.id, studentId)).length
  const studentCompletedPractice = practiceSets.filter((set) => getBestAttempt(set.id, studentId)).length
  const studentAttendance = getStudentAttendanceStats(studentId)

  const roleCopy: Record<UserRole, { title: string; description: string }> = {
    GAKUSEI: { title: t("roleGakuseiTitle"), description: t("roleGakuseiDesc") },
    SENSEI: { title: t("roleSenseiTitle"), description: t("roleSenseiDesc") },
    TANTOSHA: { title: t("roleTantoshaTitle"), description: t("roleTantoshaDesc") },
  }

  const quickActions = currentRole === "GAKUSEI"
    ? [
        { href: "/assignments", label: t("ctaAssignments"), icon: FileCheck2 },
        { href: "/practice", label: t("ctaPractice"), icon: CheckSquare },
        { href: "/exams", label: t("ctaExams"), icon: Award },
        { href: "/attendance", label: t("ctaAttendance"), icon: CalendarCheck },
      ]
    : [
        { href: "/attendance", label: t("ctaAttendance"), icon: CalendarCheck },
        { href: "/assignments", label: t("ctaAssignments"), icon: FileCheck2 },
        { href: "/practice", label: t("ctaPractice"), icon: CheckSquare },
        { href: "/cohorts", label: t("ctaCohorts"), icon: Layers },
      ]

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("overviewEyebrow")}
        title={t("overviewTitle")}
        description={t("overviewDesc")}
        action={<Badge variant={currentRole === "GAKUSEI" ? "roleGakusei" : currentRole === "SENSEI" ? "roleSensei" : "roleTantosha"}>{tCommon(currentRole === "GAKUSEI" ? "roleGakusei" : currentRole === "SENSEI" ? "roleSensei" : "roleTantosha")}</Badge>}
      />

      <section className="surface-section overflow-hidden">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">{roleCopy[currentRole].title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{roleCopy[currentRole].description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map(({ href, label, icon: Icon }, index) => (
              <Link key={href} href={href}>
                <Button variant={index === 0 ? "default" : "outline"} size="sm" className="gap-1.5">
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="dashboard-metrics" className="space-y-3">
        <h2 id="dashboard-metrics" className="sr-only">{t("programSnapshot")}</h2>
        <div className="metric-strip">
          {currentRole === "GAKUSEI" ? (
            <>
              <div className="metric-item"><p className="metric-label">{t("studentProgress")}</p><p className="metric-value">{studentAttendance.rate}%</p><p className="metric-note">{tCommon("roleGakusei")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("statAssignments")}</p><p className="metric-value">{studentPendingAssignments.length}</p><p className="metric-note">{t("pendingAssignments", { count: studentPendingAssignments.length })}</p></div>
              <div className="metric-item"><p className="metric-label">{t("statExams")}</p><p className="metric-value">{studentCompletedExams}/{exams.length}</p><p className="metric-note">{t("activeExamsSummary", { count: exams.length - studentCompletedExams })}</p></div>
              <div className="metric-item"><p className="metric-label">{t("statAssignments")}</p><p className="metric-value">{studentCompletedPractice}/{practiceSets.length}</p><p className="metric-note">{t("practiceSetsSummary", { count: practiceSets.length })}</p></div>
            </>
          ) : (
            <>
              <div className="metric-item"><p className="metric-label">{t("statCohorts")}</p><p className="metric-value">{activeCohorts.length}</p><p className="metric-note">{t("activeCohortsSummary", { count: activeCohorts.length })}</p></div>
              <div className="metric-item"><p className="metric-label">{t("statStudents")}</p><p className="metric-value">{students.length}</p><p className="metric-note">{t("statStudentsDesc")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("statAttendance")}</p><p className="metric-value">{attendanceSessions.length}</p><p className="metric-note">{t("attendanceSessionsSummary", { count: attendanceSessions.length })}</p></div>
              <div className="metric-item"><p className="metric-label">{t("statAssignments")}</p><p className="metric-value">{submissionsToReview}</p><p className="metric-note">{t("submissionsToReview", { count: submissionsToReview })}</p></div>
            </>
          )}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="attention-title">
        <SectionHeader title={<span id="attention-title">{t("attentionTitle")}</span>} description={t("attentionDesc")} />
        {currentRole === "GAKUSEI" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/assignments" className="data-row group">
              <span className="data-row-icon"><FileCheck2 className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{t("pendingAssignments", { count: studentPendingAssignments.length })}</span><span className="block text-xs text-muted-foreground">{t("ctaAssignments")}</span></span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/attendance" className="data-row group">
              <span className="data-row-icon"><CalendarCheck className="size-4" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{t("studentProgress")}: {studentAttendance.rate}%</span><span className="block text-xs text-muted-foreground">{t("ctaAttendance")}</span></span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        ) : submissionsToReview > 0 ? (
          <Link href="/assignments" className="data-row group">
            <span className="data-row-icon"><FileCheck2 className="size-4" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{t("submissionsToReview", { count: submissionsToReview })}</span><span className="block text-xs text-muted-foreground">{t("ctaAssignments")}</span></span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <EmptyState title={t("noAttention")} description={t("attentionDesc")} />
        )}
      </section>

      <section className="space-y-3" aria-labelledby="cohorts-title">
        <SectionHeader
          title={<span id="cohorts-title">{t("activeCohortsTitle")}</span>}
          description={t("activeCohortsDesc")}
          action={<Link href="/cohorts" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">{t("viewAll")}<ArrowRight className="size-3.5" /></Link>}
        />
        <div className="grid gap-3 md:grid-cols-2">
          {activeCohorts.map((cohort) => {
            const members = users.filter((user) => user.enrolledCohortIds.includes(cohort.id))
            return (
              <Link key={cohort.id} href={`/cohorts/${cohort.id}`} className="data-row group items-start">
                <span className="data-row-icon"><Layers className="size-4" /></span>
                <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs text-muted-foreground">{cohort.code}</span><Badge variant="success" className="text-[0.68rem]">{t("statusActive")}</Badge></span><span className="mt-1 block truncate text-sm font-medium">{cohort.name}</span><span className="mt-1 flex items-center gap-3 text-xs text-muted-foreground"><span>{t("studentsCount", { count: members.filter((user) => user.role === "GAKUSEI").length })}</span><span>{cohort.startDate} — {cohort.endDate}</span></span></span>
                <ArrowRight className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/users" className="data-row group"><span className="data-row-icon"><Users className="size-4" /></span><span className="flex-1"><span className="block text-sm font-medium">{t("statStudents")}</span><span className="block text-xs text-muted-foreground">{t("studentsCount", { count: students.length })}</span></span><ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5" /></Link>
        <Link href="/practice" className="data-row group"><span className="data-row-icon"><GraduationCap className="size-4" /></span><span className="flex-1"><span className="block text-sm font-medium">{t("ctaPractice")}</span><span className="block text-xs text-muted-foreground">{t("practiceSetsSummary", { count: practiceSets.length })}</span></span><ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5" /></Link>
      </section>
    </PageShell>
  )
}
