"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { useData } from "@/lib/data-context"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

const PERIOD_VALUES = [
  "第1限 (09:00 - 10:30)",
  "第2限 (10:45 - 12:15)",
  "第3限 (13:15 - 14:45)",
  "第4限 (15:00 - 16:30)",
  "夕方特別補講 (17:00 - 18:30)",
] as const

export default function AttendancePage() {
  const { attendanceSessions, cohorts, users, currentRole, addAttendanceSession, getSessionAttendanceStats, getStudentAttendanceStats } = useData()
  const t = useTranslations("attendance")
  const tCommon = useTranslations("common")

  const [selectedCohortId, setSelectedCohortId] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [formCohortId, setFormCohortId] = React.useState(cohorts[0]?.id || "")
  const [formDate, setFormDate] = React.useState(() => new Date().toISOString().split("T")[0])
  const [formPeriod, setFormPeriod] = React.useState<(typeof PERIOD_VALUES)[number]>(PERIOD_VALUES[0])
  const [formTitle, setFormTitle] = React.useState("")
  const [formInstructor, setFormInstructor] = React.useState(t("defaultInstructor"))
  const [formLocation, setFormLocation] = React.useState(t("defaultLocation"))
  const [formError, setFormError] = React.useState("")

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"
  const currentStudentId = "user-g1"
  const currentStudent = users.find((user) => user.id === currentStudentId)
  const studentStats = getStudentAttendanceStats(currentStudentId)
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const hasActiveFilters = normalizedSearchQuery.length > 0 || selectedCohortId !== "all"

  const filteredSessions = attendanceSessions.filter((session) => {
    const cohort = cohorts.find((item) => item.id === session.cohortId)
    const matchesCohort = selectedCohortId === "all" || session.cohortId === selectedCohortId
    const matchesSearch =
      session.lessonTitle.toLowerCase().includes(normalizedSearchQuery) ||
      (session.instructorName?.toLowerCase().includes(normalizedSearchQuery) ?? false) ||
      (cohort?.name.toLowerCase().includes(normalizedSearchQuery) ?? false) ||
      (cohort?.code.toLowerCase().includes(normalizedSearchQuery) ?? false) ||
      session.date.includes(normalizedSearchQuery)
    return matchesCohort && matchesSearch
  })

  const totalRecordsCount = attendanceSessions.reduce((total, session) => total + session.records.length, 0)
  const totalPresentCount = attendanceSessions.reduce(
    (total, session) => total + session.records.filter((record) => record.status === "PRESENT" || record.status === "LATE").length,
    0
  )
  const overallProgramRate = totalRecordsCount > 0 ? Math.round((totalPresentCount / totalRecordsCount) * 100) : 100

  const openCreateDialog = () => {
    setFormError("")
    setCreateDialogOpen(true)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCohortId("all")
  }

  const handleCreateSession = (event: React.FormEvent) => {
    event.preventDefault()
    if (!formCohortId) return setFormError(t("errorSelectCohort"))
    if (!formTitle.trim()) return setFormError(t("errorEnterTitle"))
    if (!formDate) return setFormError(t("errorEnterDate"))

    addAttendanceSession({
      cohortId: formCohortId,
      date: formDate,
      period: formPeriod,
      lessonTitle: formTitle.trim(),
      instructorId: "user-s1",
      instructorName: formInstructor.trim() || t("defaultInstructor"),
      location: formLocation.trim() || t("defaultRoom"),
    })
    setFormTitle("")
    setFormError("")
    setCreateDialogOpen(false)
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("badge")}
        title={t("title")}
        description={currentRole === "GAKUSEI" ? t("descStudent") : t("descStaff")}
        action={canManage ? (
          <Button onClick={openCreateDialog} className="gap-2"><Plus aria-hidden="true" className="size-4" />{t("createSession")}</Button>
        ) : <Badge variant="roleGakusei">{tCommon("roleGakusei")}</Badge>}
      />

      {currentRole === "GAKUSEI" ? (
        <div className="space-y-7">
          <section className="rounded-lg border border-border bg-card p-5 sm:p-7" aria-labelledby="attendance-compliance-title">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="roleGakusei">{t("studentRoleBadge", { name: currentStudent?.name ?? t("studentFallbackName") })}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{t("studentIdLabel")}: {currentStudent?.id ?? currentStudentId}</span>
                </div>
                <div>
                  <h2 id="attendance-compliance-title" className="text-xl font-semibold tracking-tight sm:text-2xl">{t("complianceTitle")}</h2>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t("complianceDesc")}</p>
                </div>
                {studentStats.rate >= 90 ? (
                  <p className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" />{t("compliantAlert", { rate: studentStats.rate })}</p>
                ) : (
                  <p className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"><AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600" />{t("warningAlert", { rate: studentStats.rate })}</p>
                )}
              </div>
              <div className="self-start rounded-lg border border-border bg-muted/30 px-6 py-5 text-center md:self-center">
                <p className="text-xs font-medium text-muted-foreground">{t("cumulativeRate")}</p>
                <p className={cn("mt-1 text-5xl font-semibold tracking-tight tabular-nums", studentStats.rate >= 90 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>{studentStats.rate}%</p>
                <Badge variant={studentStats.rate >= 90 ? "success" : "warning"} className="mt-2 text-xs">{t("targetRate")}</Badge>
              </div>
            </div>
          </section>

          <section aria-labelledby="student-attendance-metrics-title">
            <h2 id="student-attendance-metrics-title" className="sr-only">{t("studentMetricsLabel")}</h2>
            <div className="metric-strip">
              <div className="metric-item"><p className="metric-label">{t("present")}</p><p className="metric-value text-emerald-700 dark:text-emerald-300">{studentStats.present}</p><p className="metric-note">{t("presentSub")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("late")}</p><p className="metric-value text-amber-700 dark:text-amber-300">{studentStats.late}</p><p className="metric-note">{t("lateSub")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("absent")}</p><p className="metric-value text-rose-700 dark:text-rose-300">{studentStats.absent}</p><p className="metric-note">{t("absentSub")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("excused")}</p><p className="metric-value text-sky-700 dark:text-sky-300">{studentStats.excused}</p><p className="metric-note">{t("excusedSub")}</p></div>
            </div>
          </section>

          <section aria-labelledby="student-session-history-title" className="space-y-4">
            <SectionHeader title={<span id="student-session-history-title">{t("sessionHistory")}</span>} description={t("sessionHistoryDesc")} action={<span className="text-sm text-muted-foreground">{t("totalRecords", { count: studentStats.records.length })}</span>} />
            {studentStats.records.length === 0 ? (
              <EmptyState icon={<CalendarCheck className="size-5" />} title={t("noRecords")} />
            ) : (
              <ul className="space-y-3">
                {studentStats.records.map(({ session, record }) => {
                  const cohort = cohorts.find((item) => item.id === session.cohortId)
                  const status = record.status === "PRESENT"
                    ? { label: t("present"), variant: "success" as const, Icon: CheckCircle2 }
                    : record.status === "LATE"
                      ? { label: t("late"), variant: "warning" as const, Icon: Clock }
                      : record.status === "ABSENT"
                        ? { label: t("absent"), variant: "destructive" as const, Icon: XCircle }
                        : { label: t("excused"), variant: "outline" as const, Icon: ShieldAlert }
                  const StatusIcon = status.Icon
                  return (
                    <li key={session.id} className="data-row flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded bg-muted px-2 py-0.5 font-mono font-medium text-muted-foreground">{session.date}</span><span className="text-muted-foreground">{session.period}</span><span className="font-mono font-medium text-primary">{cohort?.code ?? session.cohortId}</span></div>
                        <h3 className="font-medium text-foreground">{session.lessonTitle}</h3>
                        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"><span>{t("instructor")}: {session.instructorName ?? session.instructorId}</span><span>{t("room")}: {session.location ?? t("defaultRoom")}</span></p>
                        {record.note && <p className="inline-block rounded bg-muted px-2 py-1 text-xs italic text-muted-foreground">{t("note")}: {record.note}</p>}
                      </div>
                      <Badge variant={status.variant} className={cn("shrink-0 gap-1", record.status === "EXCUSED" && "border-sky-500 text-sky-700 dark:text-sky-300")}><StatusIcon aria-hidden="true" className="size-3.5" />{status.label}</Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="space-y-7">
          <section aria-labelledby="attendance-metrics-title">
            <h2 id="attendance-metrics-title" className="sr-only">{t("metricsLabel")}</h2>
            <div className="metric-strip">
              <div className="metric-item"><p className="metric-label">{t("statTotalSessions")}</p><p className="metric-value">{attendanceSessions.length}</p><p className="metric-note">{t("statTotalSessionsDesc")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("statAverageRate")}</p><p className="metric-value text-emerald-700 dark:text-emerald-300">{overallProgramRate}%</p><p className="metric-note">{t("statAverageRateDesc")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("statCohortsTracked")}</p><p className="metric-value text-indigo-700 dark:text-indigo-300">{cohorts.length}</p><p className="metric-note">{t("statCohortsTrackedDesc")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("statComplianceTarget")}</p><p className="metric-value text-purple-700 dark:text-purple-300">90%</p><p className="metric-note">{t("statComplianceTargetDesc")}</p></div>
            </div>
          </section>

          <section aria-labelledby="attendance-session-list-title" className="space-y-4">
            <SectionHeader title={<span id="attendance-session-list-title">{t("sessionListTitle")}</span>} description={<span aria-live="polite">{t("resultsSummary", { shown: filteredSessions.length, total: attendanceSessions.length })}</span>} />
            <div className="filter-toolbar">
              <div role="group" aria-label={t("filterCohort")} className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-lg border border-border/60 bg-muted/50 p-1">
                <Filter aria-hidden="true" className="ml-2 mr-1 size-3.5 shrink-0 text-muted-foreground" />
                <button type="button" aria-pressed={selectedCohortId === "all"} onClick={() => setSelectedCohortId("all")} className={cn("min-h-9 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60", selectedCohortId === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}>{t("filterAll")} ({attendanceSessions.length})</button>
                {cohorts.map((cohort) => {
                  const count = attendanceSessions.filter((session) => session.cohortId === cohort.id).length
                  return <button key={cohort.id} type="button" aria-pressed={selectedCohortId === cohort.id} onClick={() => setSelectedCohortId(cohort.id)} className={cn("min-h-9 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60", selectedCohortId === cohort.id ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}>{cohort.code} ({count})</button>
                })}
              </div>
              <div className="relative min-w-0 flex-1 sm:max-w-md"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" aria-label={t("searchPlaceholder")} placeholder={t("searchPlaceholder")} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="bg-card pl-9" /></div>
            </div>
            {filteredSessions.length === 0 ? (
              <EmptyState icon={<CalendarCheck className="size-5" />} title={t("noSessionsFound")} description={hasActiveFilters ? t("noSessionsDesc") : t("noSessionsEmptyDesc")} action={hasActiveFilters ? <Button type="button" variant="outline" onClick={resetFilters}>{t("resetFilters")}</Button> : <Button type="button" onClick={openCreateDialog} className="gap-2"><Plus aria-hidden="true" className="size-4" />{t("createSession")}</Button>} />
            ) : (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredSessions.map((session) => {
                  const cohort = cohorts.find((item) => item.id === session.cohortId)
                  const stats = getSessionAttendanceStats(session.id)
                  return (
                    <li key={session.id} className="min-w-0">
                      <Card className="flex h-full flex-col border-border/80">
                        <CardHeader className="space-y-2 p-5 pb-3">
                          <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-medium text-primary">{session.date}</span><span className="text-xs text-muted-foreground">{session.period}</span></div><Badge variant="outline" className="font-mono text-xs">{cohort?.code ?? session.cohortId}</Badge></div>
                          <div><CardTitle className="text-base">{session.lessonTitle}</CardTitle><CardDescription className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs"><span>{t("instructor")}: {session.instructorName ?? session.instructorId}</span><span className="flex items-center gap-1"><MapPin aria-hidden="true" className="size-3" />{session.location ?? t("defaultRoom")}</span></CardDescription></div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col gap-4 p-5 pt-0">
                          <div className="rounded-lg bg-muted/50 p-3"><div className="flex items-baseline justify-between gap-3 text-xs"><span className="font-medium text-muted-foreground">{t("rateLabel")}</span><span className="font-semibold tabular-nums">{stats.rate}% <span className="font-normal text-muted-foreground">({stats.present + stats.late}/{stats.total})</span></span></div><div role="progressbar" aria-label={t("sessionRateLabel", { title: session.lessonTitle })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.rate} className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", stats.rate >= 90 ? "bg-emerald-500" : stats.rate >= 75 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${stats.rate}%` }} /></div><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs"><span className="text-emerald-700 dark:text-emerald-300">{t("present")}: {stats.present}</span><span className="text-amber-700 dark:text-amber-300">{t("late")}: {stats.late}</span><span className="text-rose-700 dark:text-rose-300">{t("absent")}: {stats.absent}</span>{stats.excused > 0 && <span className="text-sky-700 dark:text-sky-300">{t("excused")}: {stats.excused}</span>}</div></div>
                          <Link href={`/attendance/${session.id}`} aria-label={t("openRollCallFor", { title: session.lessonTitle })} className="mt-auto inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60">{t("openRollCall")}<ArrowRight aria-hidden="true" className="size-3.5" /></Link>
                        </CardContent>
                      </Card>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md" closeLabel={tCommon("close")}>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarCheck aria-hidden="true" className="size-5 text-primary" />{t("modalTitle")}</DialogTitle><DialogDescription>{t("modalDesc")}</DialogDescription></DialogHeader>
          <form onSubmit={handleCreateSession} className="space-y-4">
            {formError && <div role="alert" aria-live="polite" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>}
            <div className="space-y-4">
              <div><label htmlFor="attendance-create-cohort" className="mb-1 block text-xs font-medium">{t("modalCohort")}</label><select id="attendance-create-cohort" name="cohortId" value={formCohortId} onChange={(event) => setFormCohortId(event.target.value)} required className="w-full">{cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.name} ({cohort.code})</option>)}</select></div>
              <div><label htmlFor="attendance-create-title" className="mb-1 block text-xs font-medium">{t("modalLessonTitle")}</label><Input id="attendance-create-title" name="title" value={formTitle} onChange={(event) => setFormTitle(event.target.value)} placeholder={t("modalLessonPlaceholder")} required /></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="attendance-create-date" className="mb-1 block text-xs font-medium">{t("modalDate")}</label><Input id="attendance-create-date" name="date" type="date" value={formDate} onChange={(event) => setFormDate(event.target.value)} required /></div><div><label htmlFor="attendance-create-period" className="mb-1 block text-xs font-medium">{t("modalPeriod")}</label><select id="attendance-create-period" name="period" value={formPeriod} onChange={(event) => setFormPeriod(event.target.value as (typeof PERIOD_VALUES)[number])} className="w-full">{PERIOD_VALUES.map((period, index) => <option key={period} value={period}>{t(`period${index + 1}`)}</option>)}</select></div></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label htmlFor="attendance-create-instructor" className="mb-1 block text-xs font-medium">{t("modalInstructor")}</label><Input id="attendance-create-instructor" name="instructor" value={formInstructor} onChange={(event) => setFormInstructor(event.target.value)} placeholder={t("modalInstructorPlaceholder")} /></div><div><label htmlFor="attendance-create-location" className="mb-1 block text-xs font-medium">{t("modalLocation")}</label><Input id="attendance-create-location" name="location" value={formLocation} onChange={(event) => setFormLocation(event.target.value)} placeholder={t("modalLocationPlaceholder")} /></div></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>{tCommon("cancel")}</Button><Button type="submit">{t("modalSubmit")}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
