"use client"

import * as React from "react"
import Link from "next/link"
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Layers,
  Award,
  AlertTriangle,
  Calendar,
  MapPin,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useTranslations } from "next-intl"

export default function AttendancePage() {
  const {
    attendanceSessions,
    cohorts,
    users,
    currentRole,
    addAttendanceSession,
    getSessionAttendanceStats,
    getStudentAttendanceStats,
  } = useData()

  const t = useTranslations("attendance")
  const tCommon = useTranslations("common")

  // State
  const [selectedCohortId, setSelectedCohortId] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  // Dialog form state
  const [formCohortId, setFormCohortId] = React.useState(cohorts[0]?.id || "")
  const [formDate, setFormDate] = React.useState(() => new Date().toISOString().split("T")[0])
  const [formPeriod, setFormPeriod] = React.useState("第1限 (09:00 - 10:30)")
  const [formTitle, setFormTitle] = React.useState("")
  const [formInstructor, setFormInstructor] = React.useState("佐藤 健一 (Sato)")
  const [formLocation, setFormLocation] = React.useState("本館 201講義室")
  const [formError, setFormError] = React.useState("")

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"

  // Active student for student view
  const currentStudentId = "user-g1" // Budi Pratama
  const currentStudent = users.find((u) => u.id === currentStudentId)
  const studentStats = getStudentAttendanceStats(currentStudentId)

  // Filter sessions
  const filteredSessions = attendanceSessions.filter((session) => {
    const matchesCohort =
      selectedCohortId === "all" || session.cohortId === selectedCohortId
    const cohort = cohorts.find((c) => c.id === session.cohortId)
    const matchesSearch =
      session.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.instructorName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (cohort && cohort.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cohort && cohort.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      session.date.includes(searchQuery)

    return matchesCohort && matchesSearch
  })

  // Handle new session submission
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCohortId) {
      setFormError(t("errorSelectCohort"))
      return
    }
    if (!formTitle.trim()) {
      setFormError(t("errorEnterTitle"))
      return
    }
    if (!formDate) {
      setFormError(t("errorEnterDate"))
      return
    }

    addAttendanceSession({
      cohortId: formCohortId,
      date: formDate,
      period: formPeriod,
      lessonTitle: formTitle.trim(),
      instructorId: "user-s1",
      instructorName: formInstructor.trim() || "佐藤 健一 (Sato)",
      location: formLocation.trim() || "教室未定",
    })

    // Reset & close
    setFormTitle("")
    setFormError("")
    setCreateDialogOpen(false)
  }

  // Calculate high-level metrics for admin/teacher view
  const totalSessionsCount = attendanceSessions.length
  const totalRecordsCount = attendanceSessions.reduce(
    (acc, s) => acc + s.records.length,
    0
  )
  const totalPresentCount = attendanceSessions.reduce(
    (acc, s) =>
      acc +
      s.records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length,
    0
  )
  const overallProgramRate =
    totalRecordsCount > 0
      ? Math.round((totalPresentCount / totalRecordsCount) * 100)
      : 100

  return (
    <div className="page-shell">
      {/* Top Header */}
      <div className="page-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {t("badge")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("subtitle")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {currentRole === "GAKUSEI" ? t("descStudent") : t("descStaff")}
          </p>
        </div>

        {canManage && (
          <div>
            <Button
              onClick={() => {
                setFormError("")
                setCreateDialogOpen(true)
              }}
              className="gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4" />
              {t("createSession")}
            </Button>
          </div>
        )}
      </div>

      {/* STUDENT VIEW (Gakusei Portal) */}
      {currentRole === "GAKUSEI" ? (
        <div className="space-y-6">
          {/* Compliance Card */}
          <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge variant="roleGakusei">
                    {t("studentRoleBadge", { name: currentStudent?.name || "Budi Pratama" })}
                  </Badge>
                  <span className="text-xs font-mono text-muted-foreground">
                    ID: {currentStudent?.id || "user-g1"}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {t("complianceTitle")}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t("complianceDesc")}
                </p>

                {/* Compliance Alert */}
                <div className="pt-2">
                  {studentStats.rate >= 90 ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{t("compliantAlert", { rate: studentStats.rate })}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 px-3 py-2 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>{t("warningAlert", { rate: studentStats.rate })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rate Big Indicator */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border/80 min-w-[200px] text-center shadow-xs">
                <span className="text-xs font-medium text-muted-foreground">{t("cumulativeRate")}</span>
                <div className="my-2 flex items-baseline justify-center gap-1">
                  <span
                    className={cn(
                      "text-5xl font-extrabold tracking-tight",
                      studentStats.rate >= 90
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {studentStats.rate}%
                  </span>
                </div>
                <Badge
                  variant={studentStats.rate >= 90 ? "success" : "warning"}
                  className="text-[0.7rem] px-2"
                >
                  {t("targetRate")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Student Detailed Breakdown Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border/70">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{t("present")} (Present)</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {studentStats.present}
                </p>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">{t("presentSub")}</p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{t("late")} (Late)</span>
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                  {studentStats.late}
                </p>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">{t("lateSub")}</p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{t("absent")} (Absent)</span>
                  <XCircle className="h-4 w-4 text-rose-500" />
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
                  {studentStats.absent}
                </p>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">{t("absentSub")}</p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{t("excused")} (Excused)</span>
                  <ShieldAlert className="h-4 w-4 text-sky-500" />
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
                  {studentStats.excused}
                </p>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">{t("excusedSub")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Student Session History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  {t("sessionHistory")}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t("sessionHistoryDesc")}
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {t("totalRecords", { count: studentStats.records.length })}
              </span>
            </div>

            <div className="space-y-2.5">
              {studentStats.records.length === 0 ? (
                <div className="empty-state text-muted-foreground">
                  {t("noRecords")}
                </div>
              ) : (
                studentStats.records.map(({ session, record }) => {
                  const cohort = cohorts.find((c) => c.id === session.cohortId)
                  return (
                    <div
                      key={session.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold bg-muted px-2 py-0.5 rounded">
                            {session.date}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {session.period}
                          </span>
                          <span className="text-xs font-medium text-primary">
                            {cohort?.code || session.cohortId}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {session.lessonTitle}
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{t("instructor")}: {session.instructorName || session.instructorId}</span>
                          <span>•</span>
                          <span>{t("room")}: {session.location || "講義室"}</span>
                        </p>
                        {record.note && (
                          <p className="text-xs italic text-muted-foreground bg-muted/40 px-2 py-1 rounded inline-block">
                            {t("note")}: {record.note}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {record.status === "PRESENT" && (
                          <Badge variant="success" className="gap-1 text-xs px-2.5 py-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t("present")} (Present)
                          </Badge>
                        )}
                        {record.status === "LATE" && (
                          <Badge variant="warning" className="gap-1 text-xs px-2.5 py-1">
                            <Clock className="h-3.5 w-3.5" />
                            {t("late")} (Late)
                          </Badge>
                        )}
                        {record.status === "ABSENT" && (
                          <Badge variant="destructive" className="gap-1 text-xs px-2.5 py-1">
                            <XCircle className="h-3.5 w-3.5" />
                            {t("absent")} (Absent)
                          </Badge>
                        )}
                        {record.status === "EXCUSED" && (
                          <Badge variant="outline" className="gap-1 text-xs px-2.5 py-1 border-sky-500 text-sky-600 dark:text-sky-400">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            {t("excused")} (Excused)
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TEACHER / COORDINATOR VIEW (Sensei & Tantōsha) */
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border/70">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("statTotalSessions")}
                  </span>
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  {totalSessionsCount}
                </p>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                  {t("statTotalSessionsDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("statAverageRate")}
                  </span>
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {overallProgramRate}%
                </p>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                  {t("statAverageRateDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("statCohortsTracked")}
                  </span>
                  <Layers className="h-4 w-4 text-indigo-500" />
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                  {cohorts.length}
                </p>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                  {t("statCohortsTrackedDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("statComplianceTarget")}
                  </span>
                  <Award className="h-4 w-4 text-purple-500" />
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
                  90%
                </p>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                  {t("statComplianceTargetDesc")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <div className="filter-toolbar">
            {/* Cohort Select Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-medium text-muted-foreground shrink-0 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                {t("filterCohort")}
              </span>
              <button
                onClick={() => setSelectedCohortId("all")}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0",
                  selectedCohortId === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {t("filterAll")} ({attendanceSessions.length})
              </button>
              {cohorts.map((cohort) => {
                const count = attendanceSessions.filter(
                  (s) => s.cohortId === cohort.id
                ).length
                return (
                  <button
                    key={cohort.id}
                    onClick={() => setSelectedCohortId(cohort.id)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0",
                      selectedCohortId === cohort.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cohort.code} ({count})
                  </button>
                )
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label={t("searchPlaceholder")}
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{t("sessionList", { count: filteredSessions.length })}</span>
              <span>{t("sessionListHint")}</span>
            </div>

            {filteredSessions.length === 0 ? (
              <div className="empty-state space-y-3">
                <CalendarCheck className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
                <h4 className="text-base font-semibold">{t("noSessionsFound")}</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {t("noSessionsDesc")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSessions.map((session) => {
                  const cohort = cohorts.find((c) => c.id === session.cohortId)
                  const stats = getSessionAttendanceStats(session.id)

                  return (
                    <Card
                      key={session.id}
                      className="border-border/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                    >
                      <CardHeader className="p-5 pb-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded">
                              {session.date}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {session.period}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs font-mono">
                            {cohort?.code || session.cohortId}
                          </Badge>
                        </div>

                        <div>
                          <CardTitle className="text-base font-bold">
                            {session.lessonTitle}
                          </CardTitle>
                          <CardDescription className="text-xs flex items-center gap-3 mt-1 text-muted-foreground">
                            <span>{t("instructor")}: {session.instructorName || session.instructorId}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.location || "講義室"}
                            </span>
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 pt-0 space-y-4">
                        {/* Attendance Rate Progress Bar */}
                        <div className="space-y-1.5 bg-muted/40 p-3 rounded-lg">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-muted-foreground">
                              {t("rateLabel")}
                            </span>
                            <span className="font-bold text-foreground">
                              {stats.rate}%
                              <span className="text-[0.7rem] text-muted-foreground font-normal ml-1">
                                ({stats.present + stats.late}/{stats.total})
                              </span>
                            </span>
                          </div>
                          {/* Visual progress track */}
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full transition-all duration-300 rounded-full",
                                stats.rate >= 90
                                  ? "bg-emerald-500"
                                  : stats.rate >= 75
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              )}
                              style={{ width: `${stats.rate}%` }}
                            />
                          </div>

                          {/* Quick Pill Counts */}
                          <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground pt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="h-3 w-3" /> {t("present")}: {stats.present}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                              <Clock className="h-3 w-3" /> {t("late")}: {stats.late}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                              <XCircle className="h-3 w-3" /> {t("absent")}: {stats.absent}
                            </span>
                            {stats.excused > 0 && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                                  <ShieldAlert className="h-3 w-3" /> {t("excused")}: {stats.excused}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* CTA button to Roll Call Sheet */}
                        <Link href={`/attendance/${session.id}`} className="block">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs font-semibold justify-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 hover:border-emerald-400 transition-colors"
                          >
                            {t("openRollCall")}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE SESSION DIALOG */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateSession} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
                {t("modalTitle")}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t("modalDesc")}
              </DialogDescription>
            </DialogHeader>

            {formError && (
            <div role="alert" aria-live="polite" className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive">
                {formError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* Cohort Selection */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">{t("modalCohort")}</label>
                <select
                  value={formCohortId}
                  onChange={(e) => setFormCohortId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Title */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">{t("modalLessonTitle")}</label>
                <Input
                  placeholder={t("modalLessonPlaceholder")}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Date and Period */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">{t("modalDate")}</label>
                  <Input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">{t("modalPeriod")}</label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="第1限 (09:00 - 10:30)">第1限 (09:00 - 10:30)</option>
                    <option value="第2限 (10:45 - 12:15)">第2限 (10:45 - 12:15)</option>
                    <option value="第3限 (13:15 - 14:45)">第3限 (13:15 - 14:45)</option>
                    <option value="第4限 (15:00 - 16:30)">第4限 (15:00 - 16:30)</option>
                    <option value="夕方特別補講 (17:00 - 18:30)">夕方特別補講 (17:00 - 18:30)</option>
                  </select>
                </div>
              </div>

              {/* Instructor & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">{t("modalInstructor")}</label>
                  <Input
                    placeholder="講師名"
                    value={formInstructor}
                    onChange={(e) => setFormInstructor(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">{t("modalLocation")}</label>
                  <Input
                    placeholder={t("modalLocationPlaceholder")}
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateDialogOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {t("modalSubmit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
