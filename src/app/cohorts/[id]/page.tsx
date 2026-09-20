"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  GraduationCap,
  Users,
  Plus,
  Trash2,
  UserPlus,
  Search,
  Mail,
  Edit,
  Save,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ExternalLink,
  FileText,
  FileCheck2,
  Clock,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
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
import { type CohortStatus, type User } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { StudentProfileDrawer } from "@/components/student-profile-drawer"

export default function CohortDetailPage() {
  const t = useTranslations("cohortDetail")
  const tCohorts = useTranslations("cohorts")
  const tCommon = useTranslations("common")

  const params = useParams()
  const router = useRouter()
  const cohortId = params.id as string

  const {
    cohorts,
    users,
    currentRole,
    updateCohort,
    deleteCohort,
    enrollUserInCohort,
    removeUserFromCohort,
    getCohortMembers,
    getCohortAttendanceSessions,
    getCohortPracticeSets,
    getCohortAssignments,
    getAssignmentSubmissions,
    getSessionAttendanceStats,
    getCohortExams,
    getExamAttempts,
  } = useData()

  const cohort = cohorts.find((c) => c.id === cohortId)
  const members = getCohortMembers(cohortId)
  const cohortSessions = getCohortAttendanceSessions(cohortId)
  const cohortPracticeSets = getCohortPracticeSets(cohortId)
  const cohortAssignments = getCohortAssignments(cohortId)
  const cohortExams = getCohortExams(cohortId)

  const [activeTab, setActiveTab] = React.useState<"students" | "teachers" | "attendance" | "practice" | "assignments" | "exams">("students")
  const [selectedStudent, setSelectedStudent] = React.useState<User | null>(null)
  const [studentSearch, setStudentSearch] = React.useState("")
  const [enrollStudentModalOpen, setEnrollStudentModalOpen] = React.useState("")
  const [assignTeacherModalOpen, setAssignTeacherModalOpen] = React.useState(false)

  // Edit settings form
  const [isEditing, setIsEditing] = React.useState(false)
  const [editName, setEditName] = React.useState(cohort?.name || "")
  const [editCode, setEditCode] = React.useState(cohort?.code || "")
  const [editDescription, setEditDescription] = React.useState(cohort?.description || "")
  const [editTargetLevel, setEditTargetLevel] = React.useState(cohort?.targetLevel || "")
  const [editStatus, setEditStatus] = React.useState<CohortStatus>(cohort?.status || "active")
  const [editStartDate, setEditStartDate] = React.useState(cohort?.startDate || "")
  const [editEndDate, setEditEndDate] = React.useState(cohort?.endDate || "")

  const handleStartEditing = () => {
    if (cohort) {
      setEditName(cohort.name)
      setEditCode(cohort.code)
      setEditDescription(cohort.description)
      setEditTargetLevel(cohort.targetLevel)
      setEditStatus(cohort.status)
      setEditStartDate(cohort.startDate)
      setEditEndDate(cohort.endDate)
    }
    setIsEditing(!isEditing)
  }

  if (!cohort) {
    return (
      <div className="page-shell text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold">{t("notFound")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {tCohorts("noCohortsDesc")}
        </p>
        <Link href="/cohorts" className="mt-6 inline-block">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Button>
        </Link>
      </div>
    )
  }

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"

  // Students available to enroll (registered Gakusei not already in this cohort)
  const unenrolledStudents = users.filter(
    (u) => u.role === "GAKUSEI" && !u.enrolledCohortIds.includes(cohortId)
  )

  // Teachers/Tantosha available to assign
  const unassignedStaff = users.filter(
    (u) =>
      (u.role === "SENSEI" || u.role === "TANTOSHA") &&
      !u.enrolledCohortIds.includes(cohortId)
  )

  // Filtered enrolled students for search
  const filteredStudents = members.students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.japaneseName && s.japaneseName.includes(studentSearch)) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    updateCohort(cohortId, {
      name: editName.trim(),
      code: editCode.trim().toUpperCase(),
      description: editDescription.trim(),
      targetLevel: editTargetLevel,
      status: editStatus,
      startDate: editStartDate,
      endDate: editEndDate,
    })
    setIsEditing(false)
  }

  const handleDeleteCohort = () => {
    if (
      confirm(
        `コホート「${cohort.name}」を完全に削除しますか？\nこの操作は取り消せません。`
      )
    ) {
      deleteCohort(cohortId)
      router.push("/cohorts")
    }
  }

  return (
    <div className="page-shell">
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs
        items={[
          { label: tCommon("home"), href: "/" },
          { label: tCohorts("title"), href: "/cohorts" },
          { label: `${cohort.code} - ${cohort.name}` },
        ]}
      />

      {/* Cohort Header Banner */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
                {cohort.code}
              </span>
              <Badge
                variant={
                  cohort.status === "active"
                    ? "success"
                    : cohort.status === "upcoming"
                    ? "info"
                    : "secondary"
                }
                className="text-xs"
              >
                {cohort.status === "active" && tCohorts("statusActive")}
                {cohort.status === "upcoming" && tCohorts("statusUpcoming")}
                {cohort.status === "completed" && tCohorts("statusCompleted")}
                {cohort.status === "archived" && tCohorts("statusArchived")}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {cohort.targetLevel}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {cohort.name}
            </h1>

            <p className="text-sm text-muted-foreground max-w-3xl">
              {cohort.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {t("period")} {cohort.startDate} 〜 {cohort.endDate}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                {tCommon("roleGakusei")}: <strong className="text-foreground">{members.students.length}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-emerald-500" />
                {tCommon("roleSensei")}: <strong className="text-foreground">{members.teachers.length}</strong>
              </span>
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleStartEditing}
              >
                <Edit className="h-3.5 w-3.5" />
                {isEditing ? tCommon("close") : tCommon("edit")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Drawer if active */}
      {isEditing && (
        <Card className="border-primary/40 bg-card/60 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="text-base">{tCommon("edit")}</CardTitle>
            <CardDescription className="text-xs">
              {cohort.name} ({cohort.code})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">{tCohorts("modalName")}</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{tCohorts("modalCode")}</label>
                  <Input
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">{tCohorts("modalTargetLevel")}</label>
                  <Input
                    value={editTargetLevel}
                    onChange={(e) => setEditTargetLevel(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{tCohorts("modalStartDate")}</label>
                  <Input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{tCohorts("modalEndDate")}</label>
                  <Input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">{tCohorts("filterStatus")}</label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as CohortStatus)}
                  >
                    <option value="active">{tCohorts("statusActive")}</option>
                    <option value="upcoming">{tCohorts("statusUpcoming")}</option>
                    <option value="completed">{tCohorts("statusCompleted")}</option>
                    <option value="archived">{tCohorts("statusArchived")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{tCohorts("modalDescLabel")}</label>
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteCohort}
                  className="gap-1 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {tCommon("delete")}
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button type="submit" size="sm" className="gap-1.5">
                    <Save className="h-3.5 w-3.5" />
                    {tCommon("save")}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Roster Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("students")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
            activeTab === "students"
              ? "bg-secondary text-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <GraduationCap className="h-4 w-4 text-indigo-500" />
          <span>{t("tabStudents", { count: members.students.length })}</span>
        </button>

        <button
          onClick={() => setActiveTab("teachers")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
            activeTab === "teachers"
              ? "bg-secondary text-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <Users className="h-4 w-4 text-emerald-500" />
          <span>{t("tabStaff", { count: members.teachers.length + members.coordinators.length })}</span>
        </button>

        <button
          onClick={() => setActiveTab("attendance")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
            activeTab === "attendance"
              ? "bg-secondary text-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <Calendar className="h-4 w-4 text-amber-500" />
          <span>{t("tabAttendance", { count: cohortSessions.length })}</span>
        </button>

        <button
          onClick={() => setActiveTab("practice")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
            activeTab === "practice"
              ? "bg-secondary text-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span>{t("tabPractice", { count: cohortPracticeSets.length })}</span>
        </button>

        <button
          onClick={() => setActiveTab("assignments")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
            activeTab === "assignments"
              ? "bg-secondary text-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <FileCheck2 className="h-4 w-4 text-purple-500" />
          <span>{t("tabAssignments", { count: cohortAssignments.length })}</span>
        </button>

        <button
          onClick={() => setActiveTab("exams")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
            activeTab === "exams"
              ? "bg-secondary text-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <Award className="h-4 w-4 text-amber-500" />
          <span>{t("tabExams", { count: cohortExams.length })}</span>
        </button>
      </div>

      {/* Tab Content 1: Students Roster */}
      {activeTab === "students" && (
        <div className="space-y-4">
          {/* Action & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={tCohorts("searchPlaceholder")}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-8 text-xs h-9 bg-card"
              />
            </div>

            {canManage && (
              <Button
                size="sm"
                onClick={() => setEnrollStudentModalOpen("open")}
                className="gap-1.5 text-xs shadow-xs"
              >
                <UserPlus className="h-4 w-4" />
                {t("enrollStudent")}
              </Button>
            )}
          </div>

          {/* Students List */}
          {filteredStudents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/40">
              <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium">{t("noStudentsEnrolled")}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <Table>
                  <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4">{tCommon("name")}</th>
                      <th className="py-3 px-4 hidden sm:table-cell">{tCommon("email")}</th>
                      <th className="py-3 px-4 hidden md:table-cell">{tCommon("details")}</th>
                      <th className="py-3 px-4 hidden lg:table-cell">{tCommon("status")}</th>
                      <th className="py-3 px-4 text-right">{tCommon("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredStudents.map((student) => {
                      const initials = student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0">
                                {initials}
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {student.name}
                                </div>
                                {student.japaneseName && (
                                  <div className="text-xs text-muted-foreground">
                                    {student.japaneseName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 hidden sm:table-cell text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {student.email}
                            </span>
                          </td>

                          <td className="py-3 px-4 hidden md:table-cell text-xs text-muted-foreground">
                            {student.notes || "—"}
                          </td>

                          <td className="py-3 px-4 hidden lg:table-cell text-xs text-muted-foreground">
                            {student.joinedDate}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setSelectedStudent(student)}
                                className="text-xs gap-1 hover:bg-muted font-medium text-foreground/80 hover:text-foreground"
                              >
                                <FileText className="h-3 w-3 text-indigo-500" />
                                {t("viewProgress")}
                              </Button>

                              {canManage && (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => {
                                    if (confirm(t("removeConfirm"))) {
                                      removeUserFromCohort(student.id, cohortId)
                                    }
                                  }}
                                  className="text-destructive hover:bg-destructive/10 text-xs gap-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  {t("removeFromCohort")}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Staff & Teachers */}
      {activeTab === "teachers" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {cohort.name} ({cohort.code})
            </p>

            {canManage && (
              <Button
                size="sm"
                onClick={() => setAssignTeacherModalOpen(true)}
                className="gap-1.5 text-xs shadow-xs"
              >
                <UserPlus className="h-4 w-4" />
                {t("enrollStaff")}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sensei */}
            <Card className="border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  {tCommon("roleSensei")} ({members.teachers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.teachers.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">{t("noStaffAssigned")}</p>
                ) : (
                  members.teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-2.5 bg-muted/20"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          先
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {teacher.name}
                            {teacher.japaneseName && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({teacher.japaneseName})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {teacher.email}
                          </div>
                        </div>
                      </div>

                      {canManage && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            if (confirm(t("removeConfirm"))) {
                              removeUserFromCohort(teacher.id, cohortId)
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive text-xs"
                        >
                          {t("removeFromCohort")}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Coordinators */}
            <Card className="border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                  {tCommon("roleTantosha")} ({members.coordinators.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.coordinators.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">{t("noStaffAssigned")}</p>
                ) : (
                  members.coordinators.map((coordinator) => (
                    <div
                      key={coordinator.id}
                      className="flex items-center justify-between rounded-lg border border-border/50 p-2.5 bg-muted/20"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
                          担
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {coordinator.name}
                            {coordinator.japaneseName && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({coordinator.japaneseName})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {coordinator.email}
                          </div>
                        </div>
                      </div>

                      {canManage && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            if (confirm(t("removeConfirm"))) {
                              removeUserFromCohort(coordinator.id, cohortId)
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive text-xs"
                        >
                          {t("removeFromCohort")}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Content 3: Attendance Sessions */}
      {activeTab === "attendance" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t("tabAttendance", { count: cohortSessions.length })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {cohort.name} ({cohort.code})
              </p>
            </div>

            <Link href="/attendance">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <span>{t("goToAttendanceModule")}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </Link>
          </div>

          {cohortSessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/40">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium">{t("noAttendanceSessions")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cohortSessions.map((session) => {
                const stats = getSessionAttendanceStats(session.id)
                const isTargetMet = stats.rate >= 90

                return (
                  <Card key={session.id} className="border-border/80 hover:border-border transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm font-medium leading-snug">
                            {session.lessonTitle}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {session.date} • {session.period}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={isTargetMet ? "secondary" : "outline"}
                          className={cn(
                            "text-xs font-semibold shrink-0",
                            isTargetMet
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          )}
                        >
                          {stats.rate}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{session.instructorName}</span>
                        {session.location && <span>{session.location}</span>}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-muted-foreground">
                          {stats.present + stats.late}/{stats.total}
                        </span>
                        <Link href={`/attendance/${session.id}`}>
                          <Button size="xs" variant="ghost" className="gap-1 text-xs text-primary font-medium hover:bg-primary/10">
                            {t("openSession")}
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
        </div>
      )}

      {/* Tab Content 4: Practice Sets */}
      {activeTab === "practice" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t("tabPractice", { count: cohortPracticeSets.length })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {cohort.name} ({cohort.code})
              </p>
            </div>

            <Link href="/practice">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <span>{t("goToPracticeModule")}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </Link>
          </div>

          {cohortPracticeSets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/40">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium">{t("noPracticeSets")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cohortPracticeSets.map((set) => (
                <Card key={set.id} className="border-border/80 hover:border-border transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm font-medium leading-snug">
                          {set.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1 line-clamp-1">
                          {set.description || "—"}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0 font-medium">
                        {set.targetLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{set.topic}</span>
                      <span>{set.questions.length} Qs • Pass {set.passScore}%</span>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-border/50">
                      <Link href={`/practice/${set.id}`}>
                        <Button size="xs" variant="default" className="gap-1 text-xs shadow-xs">
                          {t("startPractice")}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 5: Assignments */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t("tabAssignments", { count: cohortAssignments.length })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {cohort.name} ({cohort.code})
              </p>
            </div>

            <Link href="/assignments">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <span>{t("goToAssignmentsModule")}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </Link>
          </div>

          {cohortAssignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/40">
              <FileCheck2 className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium">{t("noAssignments")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cohortAssignments.map((assignment) => {
                const subs = getAssignmentSubmissions(assignment.id)
                const gradedCount = subs.filter((s) => s.status === "GRADED").length

                return (
                  <Card key={assignment.id} className="border-border/80 hover:border-border transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm font-medium leading-snug">
                            {assignment.title}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1 line-clamp-1">
                            {assignment.description || "—"}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0 font-medium">
                          {assignment.targetLevel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {assignment.dueDate}
                        </span>
                        <span>Pass: {assignment.passScore} pts</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-muted-foreground">
                          {subs.length}/{members.students.length} dikumpulkan ({gradedCount} dinilai)
                        </span>
                        <Link href={`/assignments/${assignment.id}`}>
                          <Button size="xs" variant="ghost" className="gap-1 text-xs text-primary font-medium hover:bg-primary/10">
                            {t("openAssignment")}
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
        </div>
      )}

      {/* Tab Content 6: Exams */}
      {activeTab === "exams" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {t("tabExams", { count: cohortExams.length })}
              </h3>
              <p className="text-xs text-muted-foreground">
                {cohort.name} ({cohort.code})
              </p>
            </div>

            <Link href="/exams">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <span>{t("goToExamsModule")}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </Link>
          </div>

          {cohortExams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-8 text-center bg-card/40">
              <Award className="mx-auto h-10 w-10 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium">{t("noExams")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cohortExams.map((exam) => {
                const attempts = getExamAttempts(exam.id)
                const passedCount = attempts.filter(
                  (a) => a.percentage >= exam.passScore
                ).length
                const passRate =
                  attempts.length > 0
                    ? Math.round((passedCount / attempts.length) * 100)
                    : 0

                return (
                  <Card key={exam.id} className="border-border/80 hover:border-border transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm font-medium leading-snug">
                            {exam.title}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1 line-clamp-1">
                            {exam.description || "—"}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0 font-medium">
                          {exam.targetLevel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {exam.durationMinutes} min
                        </span>
                        <span>Pass: {exam.passScore}%</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-muted-foreground">
                          {attempts.length} peserta · {passRate}% lulus
                        </span>
                        <Link href={`/exams/${exam.id}`}>
                          <Button size="xs" variant="ghost" className="gap-1 text-xs text-primary font-medium hover:bg-primary/10">
                            {t("openAssignment")}
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
        </div>
      )}

      {/* Modal: Enroll Existing Student */}
      <Dialog
        open={enrollStudentModalOpen === "open"}
        onOpenChange={(open) => !open && setEnrollStudentModalOpen("")}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("enrollModalTitle")}</DialogTitle>
            <DialogDescription>
              {t("enrollModalDesc", { name: cohort.name })}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[340px] overflow-y-auto space-y-2 py-2 pr-1">
            {unenrolledStudents.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {t("noAvailableUsers")}
              </div>
            ) : (
              unenrolledStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium">{student.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {student.japaneseName} • {student.email}
                    </div>
                  </div>
                  <Button
                    size="xs"
                    onClick={() => {
                      enrollUserInCohort(student.id, cohortId)
                    }}
                    className="gap-1 text-xs"
                  >
                    <Plus className="h-3 w-3" />
                    {t("submitEnroll")}
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEnrollStudentModalOpen("")}
            >
              {tCommon("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Assign Staff/Sensei */}
      <Dialog
        open={assignTeacherModalOpen}
        onOpenChange={setAssignTeacherModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("enrollModalTitle")}</DialogTitle>
            <DialogDescription>
              {t("enrollModalDesc", { name: cohort.name })}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[340px] overflow-y-auto space-y-2 py-2 pr-1">
            {unassignedStaff.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {t("noAvailableUsers")}
              </div>
            ) : (
              unassignedStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{staff.name}</span>
                      <Badge
                        variant={
                          staff.role === "SENSEI" ? "roleSensei" : "roleTantosha"
                        }
                        className="text-[0.65rem] py-0"
                      >
                        {staff.role === "SENSEI" ? tCommon("roleSensei") : tCommon("roleTantosha")}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {staff.japaneseName} • {staff.email}
                    </div>
                  </div>
                  <Button
                    size="xs"
                    onClick={() => {
                      enrollUserInCohort(staff.id, cohortId)
                    }}
                    className="gap-1 text-xs"
                  >
                    <Plus className="h-3 w-3" />
                    {t("submitEnroll")}
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignTeacherModalOpen(false)}
            >
              {tCommon("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Profile Quick Overview Drawer */}
      <StudentProfileDrawer
        student={selectedStudent}
        cohortId={cohortId}
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      />
    </div>
  )
}
