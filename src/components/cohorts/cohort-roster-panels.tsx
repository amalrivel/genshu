"use client"

import { FileText, GraduationCap, Mail, Search, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import type { Cohort, User } from "@/lib/mock-data"

type Translation = (key: string, values?: Record<string, string | number>) => string

interface CohortMembers {
  students: User[]
  teachers: User[]
  coordinators: User[]
}

interface CohortRosterPanelsProps {
  activeTab: "students" | "teachers"
  cohort: Cohort
  members: CohortMembers
  filteredStudents: User[]
  canManage: boolean
  studentSearch: string
  onStudentSearchChange: (value: string) => void
  onEnrollStudent: () => void
  onAssignStaff: () => void
  onSelectStudent: (student: User) => void
  onRequestRemove: (userId: string) => void
  t: Translation
  tCohorts: Translation
  tCommon: Translation
}

function MemberActions({
  member,
  canManage,
  onRequestRemove,
  label,
}: {
  member: User
  canManage: boolean
  onRequestRemove: (userId: string) => void
  label: string
}) {
  if (!canManage) return null
  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={() => onRequestRemove(member.id)}
      className="gap-1 text-xs text-muted-foreground hover:text-destructive"
    >
      <Trash2 aria-hidden="true" className="size-3" />
      {label}
    </Button>
  )
}

export function CohortRosterPanels({
  activeTab,
  cohort,
  members,
  filteredStudents,
  canManage,
  studentSearch,
  onStudentSearchChange,
  onEnrollStudent,
  onAssignStaff,
  onSelectStudent,
  onRequestRemove,
  t,
  tCohorts,
  tCommon,
}: CohortRosterPanelsProps) {
  if (activeTab === "students") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label={tCohorts("searchPlaceholder")}
              placeholder={tCohorts("searchPlaceholder")}
              value={studentSearch}
              onChange={(event) => onStudentSearchChange(event.target.value)}
              className="h-9 bg-card pl-8 text-xs"
            />
          </div>
          {canManage && (
            <Button size="sm" onClick={onEnrollStudent} className="gap-1.5 text-xs shadow-xs">
              <UserPlus aria-hidden="true" className="size-4" />
              {t("enrollStudent")}
            </Button>
          )}
        </div>

        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="size-10" />}
            title={t("noStudentsEnrolled")}
          />
        ) : (
          <div className="surface-section overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">{tCommon("name")}</th>
                    <th className="hidden px-4 py-3 sm:table-cell">{tCommon("email")}</th>
                    <th className="hidden px-4 py-3 md:table-cell">{tCommon("details")}</th>
                    <th className="hidden px-4 py-3 lg:table-cell">{tCommon("status")}</th>
                    <th className="px-4 py-3 text-right">{tCommon("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredStudents.map((student) => {
                    const initials = student.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()

                    return (
                      <tr key={student.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-medium text-foreground">{student.name}</div>
                              {student.japaneseName && <div className="truncate text-xs text-muted-foreground">{student.japaneseName}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                          <span className="flex items-center gap-1"><Mail aria-hidden="true" className="size-3" />{student.email}</span>
                        </td>
                        <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">{student.notes || t("emptyValue")}</td>
                        <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{student.joinedDate}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-wrap justify-end gap-1">
                            <Button variant="ghost" size="xs" onClick={() => onSelectStudent(student)} className="gap-1 text-xs font-medium text-foreground/80 hover:bg-muted hover:text-foreground">
                              <FileText aria-hidden="true" className="size-3" />
                              {t("viewProgress")}
                            </Button>
                            <MemberActions member={student} canManage={canManage} onRequestRemove={onRequestRemove} label={t("removeFromCohort")} />
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
    )
  }

  const renderStaffCard = (staff: User, initial: string) => (
    <div key={staff.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 p-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <div aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initial}</div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">
            {staff.name}
            {staff.japaneseName && <span className="ml-1 text-xs text-muted-foreground">({staff.japaneseName})</span>}
          </div>
          <div className="flex items-center gap-1 truncate text-xs text-muted-foreground"><Mail aria-hidden="true" className="size-3" />{staff.email}</div>
        </div>
      </div>
      <MemberActions member={staff} canManage={canManage} onRequestRemove={onRequestRemove} label={t("removeFromCohort")} />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-muted-foreground">{cohort.name} ({cohort.code})</p>
        {canManage && <Button size="sm" onClick={onAssignStaff} className="gap-1.5 text-xs shadow-xs"><UserPlus aria-hidden="true" className="size-4" />{t("enrollStaff")}</Button>}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm"><Users aria-hidden="true" className="size-4" />{tCommon("roleSensei")} ({members.teachers.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {members.teachers.length === 0 ? <p className="py-2 text-xs text-muted-foreground">{t("noStaffAssigned")}</p> : members.teachers.map((staff) => renderStaffCard(staff, "先"))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck aria-hidden="true" className="size-4" />{tCommon("roleTantosha")} ({members.coordinators.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {members.coordinators.length === 0 ? <p className="py-2 text-xs text-muted-foreground">{t("noStaffAssigned")}</p> : members.coordinators.map((staff) => renderStaffCard(staff, "担"))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
