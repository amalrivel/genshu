"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, Calendar, Check, CheckCircle2, Clock, FileText, Filter, MapPin, Search, ShieldAlert, Sparkles, Trash2, Users, XCircle } from "lucide-react"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { StudentProfileDrawer } from "@/components/student-profile-drawer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DestructiveConfirmDialog } from "@/components/ui/destructive-confirm-dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { useData } from "@/lib/data-context"
import { type AttendanceStatus, type User } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

const STATUS_OPTIONS: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"]

export default function SessionRollCallPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const t = useTranslations("attendanceDetail")
  const tAtt = useTranslations("attendance")
  const tCommon = useTranslations("common")
  const tNav = useTranslations("nav")
  const { attendanceSessions, cohorts, users, currentRole, updateAttendanceRecord, markAllPresent, deleteAttendanceSession, getSessionAttendanceStats, getStudentAttendanceStats } = useData()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<"ALL" | AttendanceStatus>("ALL")
  const [batchSuccessNotice, setBatchSuccessNotice] = React.useState(false)
  const [selectedStudent, setSelectedStudent] = React.useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const session = attendanceSessions.find((item) => item.id === sessionId)
  const cohort = cohorts.find((item) => item.id === session?.cohortId)
  const canEdit = currentRole === "TANTOSHA" || currentRole === "SENSEI"

  const cohortStudents = React.useMemo(() => session ? users.filter((user) => user.role === "GAKUSEI" && user.enrolledCohortIds.includes(session.cohortId)) : [], [session, users])

  if (!session) {
    return <PageShell><EmptyState icon={<AlertCircle className="size-5" />} title={t("notFoundTitle")} description={t("notFoundDescription")} action={<Link href="/attendance" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"><ArrowLeft aria-hidden="true" className="size-4" />{t("backToList")}</Link>} /></PageShell>
  }

  const stats = getSessionAttendanceStats(session.id)
  const recordMap = new Map(session.records.map((record) => [record.studentId, { status: record.status, note: record.note }]))
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const hasActiveFilters = normalizedSearchQuery.length > 0 || filterStatus !== "ALL"
  const filteredStudents = cohortStudents.filter((student) => {
    const record = recordMap.get(student.id)
    const status = record?.status ?? "PRESENT"
    return (filterStatus === "ALL" || status === filterStatus) && (student.name.toLowerCase().includes(normalizedSearchQuery) || student.id.toLowerCase().includes(normalizedSearchQuery) || student.email.toLowerCase().includes(normalizedSearchQuery))
  })

  const statusMeta = (status: AttendanceStatus) => status === "PRESENT"
    ? { label: tAtt("present"), Icon: CheckCircle2, active: "bg-emerald-600 text-white", value: stats.present }
    : status === "LATE"
      ? { label: tAtt("late"), Icon: Clock, active: "bg-amber-600 text-white", value: stats.late }
      : status === "ABSENT"
        ? { label: tAtt("absent"), Icon: XCircle, active: "bg-rose-600 text-white", value: stats.absent }
        : { label: tAtt("excused"), Icon: ShieldAlert, active: "bg-sky-600 text-white", value: stats.excused }

  const handleMarkAllPresent = () => {
    if (!canEdit) return
    markAllPresent(session.id)
    setBatchSuccessNotice(true)
    setTimeout(() => setBatchSuccessNotice(false), 3000)
  }
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (!canEdit) return
    updateAttendanceRecord(session.id, studentId, status, recordMap.get(studentId)?.note)
  }
  const handleNoteChange = (studentId: string, note: string) => {
    if (!canEdit) return
    updateAttendanceRecord(session.id, studentId, recordMap.get(studentId)?.status ?? "PRESENT", note)
  }
  const handleDeleteSession = () => {
    deleteAttendanceSession(session.id)
    router.push("/attendance")
  }
  const resetFilters = () => {
    setSearchQuery("")
    setFilterStatus("ALL")
  }

  return (
    <PageShell>
      <Breadcrumbs items={[{ label: tNav("attendance"), href: "/attendance" }, { label: session.lessonTitle }]} />
      <PageHeader
        eyebrow={<Link href={`/cohorts/${session.cohortId}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60">{cohort?.code ?? session.cohortId}</Link>}
        title={session.lessonTitle}
        description={t("pageDescription", { cohort: cohort?.name ?? session.cohortId })}
        metadata={<><span><Calendar aria-hidden="true" className="mr-1 inline size-3.5" />{session.date}</span><span><Clock aria-hidden="true" className="mr-1 inline size-3.5" />{session.period}</span><span><Users aria-hidden="true" className="mr-1 inline size-3.5" />{tAtt("instructor")}: {session.instructorName ?? session.instructorId}</span><span><MapPin aria-hidden="true" className="mr-1 inline size-3.5" />{session.location ?? tAtt("defaultRoom")}</span><Badge variant={stats.rate >= 90 ? "success" : "warning"}>{t("sessionRate")}: {stats.rate}%</Badge></>}
        action={canEdit ? <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)} className="gap-1.5"><Trash2 aria-hidden="true" className="size-3.5" />{t("deleteSession")}</Button> : undefined}
      />

      {!canEdit && <p className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-50/50 p-4 text-sm text-blue-800 dark:bg-blue-950/20 dark:text-blue-200"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{t("studentRoleNotice")}</p>}

      <section aria-labelledby="session-metrics-title">
        <h2 id="session-metrics-title" className="sr-only">{t("metricsLabel")}</h2>
        <div className="metric-strip">
          {STATUS_OPTIONS.map((status) => {
            const meta = statusMeta(status)
            return <div key={status} className="metric-item"><p className="metric-label">{meta.label}</p><p className="metric-value">{meta.value}</p><p className="metric-note">{t("statusCountNote", { total: cohortStudents.length })}</p></div>
          })}
        </div>
      </section>

      {canEdit && <section className="rounded-lg border border-emerald-500/30 bg-emerald-50/40 p-4 dark:bg-emerald-950/10" aria-labelledby="fast-roll-call-title"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><Sparkles aria-hidden="true" className="size-4 text-emerald-600" /><h2 id="fast-roll-call-title" className="text-sm font-semibold">{t("fastRollCall")}</h2>{batchSuccessNotice && <span role="status" aria-live="polite" className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t("fastRollCallSuccess")}</span>}</div><p className="mt-1 text-sm text-muted-foreground">{t("fastRollCallDesc")}</p></div><Button onClick={handleMarkAllPresent} className="min-h-11 gap-2 sm:min-h-9"><Check aria-hidden="true" className="size-4" />{t("markAllPresent")}</Button></div></section>}

      <section aria-labelledby="roster-title" className="space-y-4">
        <SectionHeader title={<span id="roster-title">{t("rosterTitle")}</span>} description={<span aria-live="polite">{t("rosterSummary", { shown: filteredStudents.length, total: cohortStudents.length })}</span>} />
        <div className="filter-toolbar">
          <div role="group" aria-label={t("filterStatusLabel")} className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-lg border border-border/60 bg-muted/50 p-1"><Filter aria-hidden="true" className="ml-2 mr-1 size-3.5 shrink-0 text-muted-foreground" /><button type="button" aria-pressed={filterStatus === "ALL"} onClick={() => setFilterStatus("ALL")} className={cn("min-h-9 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60", filterStatus === "ALL" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}>{t("filterAll", { count: cohortStudents.length })}</button>{STATUS_OPTIONS.map((status) => { const meta = statusMeta(status); return <button key={status} type="button" aria-pressed={filterStatus === status} onClick={() => setFilterStatus(status)} className={cn("min-h-9 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60", filterStatus === status ? meta.active : "text-muted-foreground hover:text-foreground")}>{meta.label} ({meta.value})</button> })}</div>
          <div className="relative min-w-0 flex-1 sm:max-w-md"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" aria-label={t("searchRoster")} placeholder={t("searchRoster")} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="bg-card pl-9" /></div>
        </div>

        {filteredStudents.length === 0 ? <EmptyState icon={<Users className="size-5" />} title={t("noStudentsFound")} description={hasActiveFilters ? t("noStudentsFilteredDescription") : t("noStudentsEmptyDescription")} action={hasActiveFilters ? <Button type="button" variant="outline" onClick={resetFilters}>{t("resetFilters")}</Button> : undefined} /> : <ul className="space-y-3">{filteredStudents.map((student, index) => {
          const record = recordMap.get(student.id)
          const currentStatus = record?.status ?? "PRESENT"
          const overall = getStudentAttendanceStats(student.id, session.cohortId)
          return <li key={student.id} className="data-row flex-col items-stretch gap-4 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-semibold">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-medium">{student.name}</span><span title={t("cumulativeRateTooltip", { rate: overall.rate, status: overall.rate >= 90 ? t("complianceMet") : t("complianceBelow") })} className={cn("rounded px-1.5 py-0.5 font-mono text-xs font-semibold", overall.rate >= 90 ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300")}>{t("cumulativeRateBadge", { rate: overall.rate })}</span><Button variant="ghost" size="xs" aria-label={t("viewProgressFor", { name: student.name })} onClick={() => setSelectedStudent(student)} className="gap-1 text-muted-foreground"><FileText aria-hidden="true" className="size-3" /><span>{tCommon("viewProgress")}</span></Button></div><p className="truncate font-mono text-xs text-muted-foreground">{student.id} • {student.email}</p></div></div><div role="group" aria-label={t("statusControlsFor", { name: student.name })} className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">{STATUS_OPTIONS.map((status) => { const meta = statusMeta(status); const Icon = meta.Icon; return <button key={status} type="button" disabled={!canEdit} aria-pressed={currentStatus === status} aria-label={t("setStatusFor", { name: student.name, status: meta.label })} onClick={() => handleStatusChange(student.id, status)} className={cn("flex min-h-11 items-center justify-center gap-1 rounded-lg px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-9", currentStatus === status ? meta.active : "bg-muted text-muted-foreground hover:text-foreground")}><Icon aria-hidden="true" className="size-3.5" />{meta.label}</button> })}</div><Input disabled={!canEdit} aria-label={t("noteFor", { name: student.name })} placeholder={canEdit ? t("notePlaceholder") : t("noNote")} value={record?.note ?? ""} onChange={(event) => handleNoteChange(student.id, event.target.value)} className="min-h-11 w-full bg-background/80 lg:min-h-9 lg:w-64" /></li>
        })}</ul>}
      </section>

      <DestructiveConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title={t("deleteSession")} description={t("deleteConfirm")} confirmLabel={tCommon("delete")} cancelLabel={tCommon("cancel")} closeLabel={tCommon("close")} onConfirm={handleDeleteSession} />
      <StudentProfileDrawer student={selectedStudent} cohortId={session.cohortId} open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)} />
    </PageShell>
  )
}
