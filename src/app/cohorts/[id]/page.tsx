"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  GraduationCap,
  Users,
  Plus,
  Trash2,
  Edit,
  Save,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ExternalLink,
  FileCheck2,
  Clock,
  Award,
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
import { type CohortStatus, type User } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { StudentProfileDrawer } from "@/components/student-profile-drawer"
import { PageHeader } from "@/components/layout/page-frame"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DestructiveConfirmDialog } from "@/components/ui/destructive-confirm-dialog"
import { CohortStatusBadge } from "@/components/cohorts/cohort-status-badge"
import { CohortRosterPanels } from "@/components/cohorts/cohort-roster-panels"

type CohortTab = "students" | "teachers" | "attendance" | "practice" | "assignments" | "exams"
type DestructiveAction =
  | { type: "delete-cohort" }
  | { type: "remove-member"; userId: string }

const cohortTabs: CohortTab[] = ["students", "teachers", "attendance", "practice", "assignments", "exams"]

function isCohortTab(value: string | null): value is CohortTab {
  return value !== null && cohortTabs.includes(value as CohortTab)
}

function CohortDetailContent() {
  const t = useTranslations("cohortDetail")
  const tCohorts = useTranslations("cohorts")
  const tCommon = useTranslations("common")

  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
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

  const activeTab: CohortTab = isCohortTab(searchParams.get("tab"))
    ? searchParams.get("tab") as CohortTab
    : "students"
  const [selectedStudent, setSelectedStudent] = React.useState<User | null>(null)
  const [studentSearch, setStudentSearch] = React.useState("")
  const [enrollStudentModalOpen, setEnrollStudentModalOpen] = React.useState("")
  const [assignTeacherModalOpen, setAssignTeacherModalOpen] = React.useState(false)
  const [pendingDestructiveAction, setPendingDestructiveAction] = React.useState<DestructiveAction | null>(null)

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
    setPendingDestructiveAction({ type: "delete-cohort" })
  }

  const handleTabChange = (value: string | null) => {
    if (!isCohortTab(value)) return
    router.push(`${pathname}?tab=${value}`, { scroll: false })
  }

  const handleConfirmDestructiveAction = () => {
    if (!pendingDestructiveAction) return
    if (pendingDestructiveAction.type === "delete-cohort") {
      deleteCohort(cohortId)
      router.push("/cohorts")
    } else {
      removeUserFromCohort(pendingDestructiveAction.userId, cohortId)
    }
  }

  const pendingMember = pendingDestructiveAction?.type === "remove-member"
    ? users.find((user) => user.id === pendingDestructiveAction.userId)
    : undefined

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

      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
              {cohort.code}
            </span>
            <CohortStatusBadge status={cohort.status} className="gap-1 text-xs" />
            <Badge variant="outline" className="text-xs">
              {cohort.targetLevel}
            </Badge>
          </span>
        }
        title={cohort.name}
        description={cohort.description}
        metadata={
          <>
            <span className="flex items-center gap-1.5">
              <Calendar aria-hidden="true" className="size-3.5" />
              {t("period")} {cohort.startDate} 〜 {cohort.endDate}
            </span>
            <span>
              {tCommon("roleGakusei")}: <strong className="text-foreground">{members.students.length}</strong>
            </span>
            <span>
              {tCommon("roleSensei")}: <strong className="text-foreground">{members.teachers.length}</strong>
            </span>
          </>
        }
        action={
          canManage ? (
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleStartEditing}
            >
              <Edit aria-hidden="true" className="size-3.5" />
              {isEditing ? tCommon("close") : tCommon("edit")}
            </Button>
          ) : undefined
        }
      />

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
                  <label htmlFor="cohort-name" className="block text-xs font-medium mb-1">{tCohorts("modalName")}</label>
                  <Input
                    id="cohort-name"
                    name="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cohort-code" className="block text-xs font-medium mb-1">{tCohorts("modalCode")}</label>
                  <Input
                    id="cohort-code"
                    name="code"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="cohort-level" className="block text-xs font-medium mb-1">{tCohorts("modalTargetLevel")}</label>
                  <Input
                    id="cohort-level"
                    name="targetLevel"
                    value={editTargetLevel}
                    onChange={(e) => setEditTargetLevel(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="cohort-start-date" className="block text-xs font-medium mb-1">{tCohorts("modalStartDate")}</label>
                  <Input
                    id="cohort-start-date"
                    name="startDate"
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="cohort-end-date" className="block text-xs font-medium mb-1">{tCohorts("modalEndDate")}</label>
                  <Input
                    id="cohort-end-date"
                    name="endDate"
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cohort-status" className="block text-xs font-medium mb-1">{tCohorts("filterStatus")}</label>
                  <select
                    id="cohort-status"
                    name="status"
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
                  <label htmlFor="cohort-description" className="block text-xs font-medium mb-1">{tCohorts("modalDescLabel")}</label>
                  <Input
                    id="cohort-description"
                    name="description"
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

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList aria-label={t("tabsLabel")}>
          <TabsTrigger value="students">
            <GraduationCap aria-hidden="true" className="size-4" />
            <span>{t("tabStudents", { count: members.students.length })}</span>
          </TabsTrigger>
          <TabsTrigger value="teachers">
            <Users aria-hidden="true" className="size-4" />
            <span>{t("tabStaff", { count: members.teachers.length + members.coordinators.length })}</span>
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Calendar aria-hidden="true" className="size-4" />
            <span>{t("tabAttendance", { count: cohortSessions.length })}</span>
          </TabsTrigger>
          <TabsTrigger value="practice">
            <BookOpen aria-hidden="true" className="size-4" />
            <span>{t("tabPractice", { count: cohortPracticeSets.length })}</span>
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <FileCheck2 aria-hidden="true" className="size-4" />
            <span>{t("tabAssignments", { count: cohortAssignments.length })}</span>
          </TabsTrigger>
          <TabsTrigger value="exams">
            <Award aria-hidden="true" className="size-4" />
            <span>{t("tabExams", { count: cohortExams.length })}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>

      <CohortRosterPanels
        activeTab={activeTab === "teachers" ? "teachers" : "students"}
        cohort={cohort}
        members={members}
        filteredStudents={filteredStudents}
        canManage={canManage}
        studentSearch={studentSearch}
        onStudentSearchChange={setStudentSearch}
        onEnrollStudent={() => setEnrollStudentModalOpen("open")}
        onAssignStaff={() => setAssignTeacherModalOpen(true)}
        onSelectStudent={setSelectedStudent}
        onRequestRemove={(userId) => setPendingDestructiveAction({ type: "remove-member", userId })}
        t={t}
        tCohorts={tCohorts}
        tCommon={tCommon}
      />

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
                          {set.description || t("emptyValue")}
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
                      <span>{t("questionsSummary", { count: set.questions.length })} · {t("passScore", { score: set.passScore })}</span>
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
                          {assignment.description || t("emptyValue")}
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
                        <span>{t("passPoints", { score: assignment.passScore })}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-muted-foreground">
                          {t("submittedSummary", { submitted: subs.length, total: members.students.length, graded: gradedCount })}
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
                          {exam.description || t("emptyValue")}
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
                          {t("durationMinutes", { count: exam.durationMinutes })}
                        </span>
                        <span>{t("passScore", { score: exam.passScore })}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                        <span className="text-muted-foreground">
                          {t("examAttemptsSummary", { count: attempts.length, rate: passRate })}
                        </span>
                        <Link href={`/exams/${exam.id}`}>
                          <Button size="xs" variant="ghost" className="gap-1 text-xs text-primary font-medium hover:bg-primary/10">
                            {t("openExam")}
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
        </TabsContent>
      </Tabs>

      {/* Modal: Enroll Existing Student */}
      <Dialog
        open={enrollStudentModalOpen === "open"}
        onOpenChange={(open) => !open && setEnrollStudentModalOpen("")}
      >
        <DialogContent className="max-w-md" closeLabel={tCommon("close")}>
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
        <DialogContent className="max-w-md" closeLabel={tCommon("close")}>
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

      <DestructiveConfirmDialog
        open={pendingDestructiveAction !== null}
        onOpenChange={(open) => !open && setPendingDestructiveAction(null)}
        title={
          pendingDestructiveAction?.type === "delete-cohort"
            ? t("deleteCohortTitle")
            : t("removeMemberTitle")
        }
        description={
          pendingDestructiveAction?.type === "delete-cohort"
            ? t("deleteCohortDesc", { name: cohort.name })
            : t("removeMemberDesc", { name: pendingMember?.name ?? "" })
        }
        confirmLabel={
          pendingDestructiveAction?.type === "delete-cohort"
            ? tCommon("delete")
            : t("removeFromCohort")
        }
        cancelLabel={tCommon("cancel")}
        onConfirm={handleConfirmDestructiveAction}
      />

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

export default function CohortDetailPage() {
  return (
    <React.Suspense fallback={<div className="page-shell" aria-busy="true" />}>
      <CohortDetailContent />
    </React.Suspense>
  )
}
