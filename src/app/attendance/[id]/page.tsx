"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  Check,
  Trash2,
  AlertCircle,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/lib/data-context"
import { type AttendanceStatus, type User } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { StudentProfileDrawer } from "@/components/student-profile-drawer"

export default function SessionRollCallPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const t = useTranslations("attendanceDetail")
  const tAtt = useTranslations("attendance")
  const tCommon = useTranslations("common")
  const tNav = useTranslations("nav")

  const {
    attendanceSessions,
    cohorts,
    users,
    currentRole,
    updateAttendanceRecord,
    markAllPresent,
    deleteAttendanceSession,
    getSessionAttendanceStats,
    getStudentAttendanceStats,
  } = useData()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<"ALL" | AttendanceStatus>("ALL")
  const [batchSuccessNotice, setBatchSuccessNotice] = React.useState(false)
  const [selectedStudent, setSelectedStudent] = React.useState<User | null>(null)

  // Find session
  const session = attendanceSessions.find((s) => s.id === sessionId)
  const cohort = cohorts.find((c) => c.id === session?.cohortId)

  // Students enrolled in this cohort
  const cohortStudents = React.useMemo(() => {
    if (!session) return []
    return users.filter(
      (u) => u.role === "GAKUSEI" && u.enrolledCohortIds.includes(session.cohortId)
    )
  }, [users, session])

  const canEdit = currentRole === "TANTOSHA" || currentRole === "SENSEI"

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">{tAtt("noSessionsFound")}</h2>
        <p className="text-sm text-muted-foreground">
          {tAtt("noSessionsDesc")}
        </p>
        <Link href="/attendance">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Button>
        </Link>
      </div>
    )
  }

  const stats = getSessionAttendanceStats(session.id)

  // Get or build record map
  const recordMap = new Map<string, { status: AttendanceStatus; note?: string }>()
  session.records.forEach((r) => {
    recordMap.set(r.studentId, { status: r.status, note: r.note })
  })

  // Filtered student roster
  const filteredStudents = cohortStudents.filter((student) => {
    const rec = recordMap.get(student.id)
    const currentStatus = rec?.status || "PRESENT"

    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "ALL" || currentStatus === filterStatus

    return matchesSearch && matchesStatus
  })

  const handleMarkAllPresent = () => {
    if (!canEdit) return
    markAllPresent(session.id)
    setBatchSuccessNotice(true)
    setTimeout(() => {
      setBatchSuccessNotice(false)
    }, 3000)
  }

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    if (!canEdit) return
    const currentRec = recordMap.get(studentId)
    updateAttendanceRecord(session.id, studentId, newStatus, currentRec?.note)
  }

  const handleNoteChange = (studentId: string, note: string) => {
    if (!canEdit) return
    const currentRec = recordMap.get(studentId)
    const currentStatus = currentRec?.status || "PRESENT"
    updateAttendanceRecord(session.id, studentId, currentStatus, note)
  }

  const handleDeleteSession = () => {
    if (confirm(t("deleteConfirm"))) {
      deleteAttendanceSession(session.id)
      router.push("/attendance")
    }
  }

  return (
    <div className="page-shell">
      {/* Top Bar with Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: tNav("attendance"), href: "/attendance" },
            { label: session.lessonTitle },
          ]}
        />

        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteSession}
            className="text-destructive hover:bg-destructive/10 text-xs self-start sm:self-auto gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("deleteSession")}
          </Button>
        )}
      </div>

      {/* Role permission alert for Gakusei */}
      {!canEdit && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-4 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{t("studentRoleNotice")}</span>
        </div>
      )}

      {/* Session Metadata Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/cohorts/${session.cohortId}`}>
                <Badge
                  variant="outline"
                  className="font-mono text-xs hover:bg-muted cursor-pointer transition-colors"
                >
                  {cohort?.code || session.cohortId}
                </Badge>
              </Link>
              {cohort?.name && (
                <Link
                  href={`/cohorts/${session.cohortId}`}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cohort.name}
                </Link>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {session.lessonTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {session.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {session.period}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                {tAtt("instructor")}: {session.instructorName || session.instructorId}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {session.location || "講義室"}
              </span>
            </div>
          </div>

          {/* Rate & Live Count Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/70 self-start md:self-center shrink-0">
            <div className="text-right">
              <div className="text-xs font-medium text-muted-foreground">{t("sessionRate")}</div>
              <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                {stats.rate}%
              </div>
              <div className="text-[0.7rem] text-muted-foreground">
                {t("sessionRateSummary", { attended: stats.present + stats.late, total: cohortStudents.length })}
              </div>
            </div>
          </div>
        </div>

        {/* Live Status Counter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-900 dark:text-emerald-200">{tAtt("present")}</span>
            </div>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {stats.present}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-900 dark:text-amber-200">{tAtt("late")}</span>
            </div>
            <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
              {stats.late}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-medium text-rose-900 dark:text-rose-200">{tAtt("absent")}</span>
            </div>
            <span className="text-lg font-bold text-rose-700 dark:text-rose-300">
              {stats.absent}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-sky-600" />
              <span className="text-xs font-medium text-sky-900 dark:text-sky-200">{tAtt("excused")}</span>
            </div>
            <span className="text-lg font-bold text-sky-700 dark:text-sky-300">
              {stats.excused}
            </span>
          </div>
        </div>
      </div>

      {/* Teacher Batch Action Toolbar */}
      {canEdit && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/10">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-foreground">
                {t("fastRollCall")}
              </span>
              {batchSuccessNotice && (
                <span className="text-xs font-semibold text-emerald-600 animate-fade-in">
                  {t("fastRollCallSuccess")}
                </span>
              )}
            </div>
            <p className="text-[0.7rem] text-muted-foreground">
              {t("fastRollCallDesc")}
            </p>
          </div>

          <Button
            size="sm"
            onClick={handleMarkAllPresent}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-xs shrink-0"
          >
            <Check className="h-4 w-4" />
            {t("markAllPresent")}
          </Button>
        </div>
      )}

      {/* Roster Controls: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/80">
        {/* Status quick filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0",
              filterStatus === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {t("filterAll", { count: cohortStudents.length })}
          </button>
          <button
            onClick={() => setFilterStatus("PRESENT")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0",
              filterStatus === "PRESENT"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tAtt("present")} ({stats.present})
          </button>
          <button
            onClick={() => setFilterStatus("LATE")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0",
              filterStatus === "LATE"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tAtt("late")} ({stats.late})
          </button>
          <button
            onClick={() => setFilterStatus("ABSENT")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0",
              filterStatus === "ABSENT"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tAtt("absent")} ({stats.absent})
          </button>
          <button
            onClick={() => setFilterStatus("EXCUSED")}
            className={cn(
              "px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0",
              filterStatus === "EXCUSED"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tAtt("excused")} ({stats.excused})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={t("searchRoster")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Student Roll Call Cards / Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{t("rosterList", { count: filteredStudents.length })}</span>
          <span>{t("rosterHint")}</span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card text-muted-foreground">
            {t("noStudentsFound")}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredStudents.map((student, idx) => {
              const rec = recordMap.get(student.id)
              const currentStatus: AttendanceStatus = rec?.status || "PRESENT"
              const studentOverall = getStudentAttendanceStats(student.id, session.cohortId)

              return (
                <div
                  key={student.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-card hover:border-border transition-colors shadow-xs"
                >
                  {/* Student Identity */}
                  <div className="flex items-center gap-3 min-w-[240px]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-bold text-foreground">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {student.name}
                        </span>
                        {/* Overall rate badge */}
                        <span
                          className={cn(
                            "text-[0.68rem] px-1.5 py-0.2 rounded font-mono font-semibold",
                            studentOverall.rate >= 90
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          )}
                          title={`通算出席率: ${studentOverall.rate}% (${studentOverall.rate >= 90 ? '合格基準達成' : '要件未達'})`}
                        >
                          {t("cumulativeRateBadge", { rate: studentOverall.rate })}
                        </span>

                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setSelectedStudent(student)}
                          className="h-6 px-1.5 text-[0.7rem] text-muted-foreground hover:text-foreground gap-1"
                        >
                          <FileText className="h-3 w-3 text-indigo-500" />
                          <span>{tCommon("viewProgress")}</span>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {student.id} • {student.email}
                      </p>
                    </div>
                  </div>

                  {/* Status Toggle Segmented Control */}
                  <div className="flex items-center gap-1.5 self-start lg:self-center flex-wrap">
                    {/* PRESENT BUTTON */}
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleStatusChange(student.id, "PRESENT")}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-80",
                        currentStatus === "PRESENT"
                          ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {tAtt("present")}
                    </button>

                    {/* LATE BUTTON */}
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleStatusChange(student.id, "LATE")}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-80",
                        currentStatus === "LATE"
                          ? "bg-amber-600 text-white shadow-xs ring-2 ring-amber-600/30"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {tAtt("late")}
                    </button>

                    {/* ABSENT BUTTON */}
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleStatusChange(student.id, "ABSENT")}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-80",
                        currentStatus === "ABSENT"
                          ? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-600/30"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {tAtt("absent")}
                    </button>

                    {/* EXCUSED BUTTON */}
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleStatusChange(student.id, "EXCUSED")}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-80",
                        currentStatus === "EXCUSED"
                          ? "bg-sky-600 text-white shadow-xs ring-2 ring-sky-600/30"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      {tAtt("excused")}
                    </button>
                  </div>

                  {/* Note / Memo Input */}
                  <div className="w-full lg:w-64 shrink-0">
                    <Input
                      disabled={!canEdit}
                      placeholder={canEdit ? t("notePlaceholder") : t("noNote")}
                      value={rec?.note || ""}
                      onChange={(e) => handleNoteChange(student.id, e.target.value)}
                      className="h-8 text-xs bg-background/80"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {/* Student Profile Quick Overview Drawer */}
      <StudentProfileDrawer
        student={selectedStudent}
        cohortId={session.cohortId}
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      />
    </div>
  )
}
