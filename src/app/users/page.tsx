"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { FileText, GraduationCap, Mail, Search, ShieldCheck, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useData } from "@/lib/data-context"
import { type UserRole, type User } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { StudentProfileDrawer } from "@/components/student-profile-drawer"

type RoleFilter = "ALL" | UserRole

export default function UsersPage() {
  const t = useTranslations("users")
  const tCommon = useTranslations("common")
  const { users, cohorts, currentRole, addUser, getUserCohorts } = useData()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("ALL")
  const [selectedStudent, setSelectedStudent] = React.useState<User | null>(null)
  const [createUserOpen, setCreateUserOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [japaneseName, setJapaneseName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<UserRole>("GAKUSEI")
  const [selectedCohortId, setSelectedCohortId] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [formError, setFormError] = React.useState("")

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"
  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const hasActiveFilters = normalizedSearchQuery.length > 0 || roleFilter !== "ALL"

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(normalizedSearchQuery) ||
      (user.japaneseName && user.japaneseName.includes(searchQuery.trim())) ||
      user.email.toLowerCase().includes(normalizedSearchQuery) ||
      (user.notes && user.notes.toLowerCase().includes(normalizedSearchQuery))

    return matchesSearch && (roleFilter === "ALL" || user.role === roleFilter)
  })

  const roleCounts = {
    ALL: users.length,
    GAKUSEI: users.filter((user) => user.role === "GAKUSEI").length,
    SENSEI: users.filter((user) => user.role === "SENSEI").length,
    TANTOSHA: users.filter((user) => user.role === "TANTOSHA").length,
  }

  const openCreateDialog = () => {
    setFormError("")
    setCreateUserOpen(true)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setRoleFilter("ALL")
  }

  const handleCreateUser = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setFormError(t("errorName"))
      return
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError(t("errorEmail"))
      return
    }
    if (users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())) {
      setFormError(t("errorEmailExists"))
      return
    }

    addUser({
      name: name.trim(),
      japaneseName: japaneseName.trim() || undefined,
      email: email.trim().toLowerCase(),
      role,
      status: "active",
      enrolledCohortIds: selectedCohortId ? [selectedCohortId] : [],
      notes: notes.trim() || undefined,
    })

    setName("")
    setJapaneseName("")
    setEmail("")
    setSelectedCohortId("")
    setNotes("")
    setFormError("")
    setCreateUserOpen(false)
  }

  const getRoleBadge = (userRole: UserRole) => {
    const content = userRole === "GAKUSEI"
      ? { variant: "roleGakusei" as const, icon: GraduationCap, label: tCommon("roleGakusei") }
      : userRole === "SENSEI"
        ? { variant: "roleSensei" as const, icon: Users, label: tCommon("roleSensei") }
        : { variant: "roleTantosha" as const, icon: ShieldCheck, label: tCommon("roleTantosha") }
    const Icon = content.icon

    return <Badge variant={content.variant} className="gap-1 text-xs"><Icon aria-hidden="true" className="size-3" />{content.label}</Badge>
  }

  const getStatusBadge = (status: User["status"]) => (
    <Badge variant={status === "active" ? "success" : "secondary"} className="text-[0.68rem]">
      {status === "active" ? t("statusActive") : t("statusInactive")}
    </Badge>
  )

  const metrics: Array<{ id: RoleFilter; label: string; note: string; className?: string }> = [
    { id: "ALL", label: t("cardTotal"), note: t("filterAll") },
    { id: "GAKUSEI", label: t("cardGakusei"), note: tCommon("roleGakusei"), className: "text-indigo-700 dark:text-indigo-300" },
    { id: "SENSEI", label: t("cardSensei"), note: tCommon("roleSensei"), className: "text-emerald-700 dark:text-emerald-300" },
    { id: "TANTOSHA", label: t("cardTantosha"), note: tCommon("roleTantosha"), className: "text-purple-700 dark:text-purple-300" },
  ]

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("badge")}
        title={t("title")}
        description={t("desc")}
        action={canManage ? (
          <Button onClick={openCreateDialog} className="gap-2">
            <UserPlus aria-hidden="true" className="size-4" />
            {t("addUser")}
          </Button>
        ) : (
          <Badge variant="roleGakusei">{tCommon("roleGakusei")}</Badge>
        )}
      />

      <section aria-labelledby="user-metrics-title">
        <h2 id="user-metrics-title" className="sr-only">{t("metricsLabel")}</h2>
        <div className="metric-strip" role="group" aria-label={t("filterRole")}>
          {metrics.map((metric) => (
            <button
              key={metric.id}
              type="button"
              aria-pressed={roleFilter === metric.id}
              onClick={() => setRoleFilter(metric.id)}
              className={cn(
                "metric-item min-h-24 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60",
                roleFilter === metric.id && "bg-muted/60",
                metric.className
              )}
            >
              <p className="metric-label">{metric.label}</p>
              <p className="metric-value">{roleCounts[metric.id]}</p>
              <p className="metric-note">{metric.note}</p>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="user-list-title" className="space-y-4">
        <SectionHeader
          title={<span id="user-list-title">{t("listTitle")}</span>}
          description={<span aria-live="polite">{t("resultsSummary", { shown: filteredUsers.length, total: users.length })}</span>}
        />

        <div className="filter-toolbar">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label={t("searchPlaceholder")}
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="bg-card pl-9"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" />}
            title={t("noUsersFound")}
            description={hasActiveFilters ? t("noUsersDesc") : t("noUsersEmptyDesc")}
            action={hasActiveFilters ? (
              <Button type="button" variant="outline" onClick={resetFilters}>{t("resetFilters")}</Button>
            ) : canManage ? (
              <Button type="button" onClick={openCreateDialog} className="gap-2"><UserPlus aria-hidden="true" className="size-4" />{t("addUser")}</Button>
            ) : undefined}
          />
        ) : (
          <div className="surface-section overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <caption className="sr-only">{t("tableCaption")}</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">{t("colName")}</TableHead>
                    <TableHead scope="col">{t("colRole")}</TableHead>
                    <TableHead scope="col" className="hidden sm:table-cell">{t("colEmail")}</TableHead>
                    <TableHead scope="col" className="hidden md:table-cell">{t("colCohorts")}</TableHead>
                    <TableHead scope="col" className="hidden lg:table-cell">{t("colNotes")}</TableHead>
                    <TableHead scope="col" className="hidden xl:table-cell">{t("colJoined")}</TableHead>
                    <TableHead scope="col" className="text-right">{tCommon("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const userCohorts = getUserCohorts(user.id)
                    const initials = user.name.split(" ").map((part) => part[0]).join("").substring(0, 2).toUpperCase()

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-3">
                            <div aria-hidden="true" className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold", user.role === "GAKUSEI" && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", user.role === "SENSEI" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", user.role === "TANTOSHA" && "bg-purple-500/10 text-purple-600 dark:text-purple-400")}>{initials}</div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5"><span className="truncate font-medium text-foreground">{user.name}</span>{getStatusBadge(user.status)}</div>
                              {user.japaneseName && <div className="truncate text-xs text-muted-foreground">{user.japaneseName}</div>}
                              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground sm:hidden"><Mail aria-hidden="true" className="size-3 shrink-0" /><span className="truncate">{user.email}</span></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground sm:table-cell"><span className="flex items-center gap-1.5"><Mail aria-hidden="true" className="size-3 shrink-0" />{user.email}</span></TableCell>
                        <TableCell className="hidden text-xs md:table-cell">
                          {userCohorts.length === 0 ? <span className="text-[0.75rem] italic text-muted-foreground">{t("noCohort")}</span> : <div className="flex flex-wrap gap-1">{userCohorts.map((cohort) => <Link key={cohort.id} href={`/cohorts/${cohort.id}`} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"><Badge variant="outline" className="px-1.5 py-0 font-mono text-[0.68rem] hover:bg-muted">{cohort.code}</Badge></Link>)}</div>}
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">{user.notes || "—"}</TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">{user.joinedDate}</TableCell>
                        <TableCell className="text-right">
                          {user.role === "GAKUSEI" && <Button variant="ghost" size="icon-sm" aria-label={t("viewProgressFor", { name: user.name })} onClick={() => setSelectedStudent(user)} className="text-foreground/80 hover:bg-muted hover:text-foreground sm:w-auto sm:gap-1 sm:px-2"><FileText aria-hidden="true" className="size-3 text-indigo-500" /><span className="sr-only sm:not-sr-only">{tCommon("viewProgress")}</span></Button>}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </section>

      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="max-w-md" closeLabel={tCommon("close")}>
          <DialogHeader><DialogTitle>{t("modalTitle")}</DialogTitle><DialogDescription>{t("modalDesc")}</DialogDescription></DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
            {formError && <div role="alert" aria-live="polite" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{formError}</div>}
            <div><label htmlFor="user-create-name" className="mb-1 block text-xs font-medium">{t("modalName")}</label><Input id="user-create-name" name="name" placeholder={t("modalNamePlaceholder")} value={name} onChange={(event) => setName(event.target.value)} required /></div>
            <div><label htmlFor="user-create-japanese-name" className="mb-1 block text-xs font-medium">{t("modalNameKana")}</label><Input id="user-create-japanese-name" name="japaneseName" placeholder={t("modalNameKanaPlaceholder")} value={japaneseName} onChange={(event) => setJapaneseName(event.target.value)} /></div>
            <div><label htmlFor="user-create-email" className="mb-1 block text-xs font-medium">{t("modalEmail")}</label><Input id="user-create-email" name="email" type="email" placeholder={t("modalEmailPlaceholder")} value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><label htmlFor="user-create-role" className="mb-1 block text-xs font-medium">{t("modalRole")}</label><select id="user-create-role" name="role" className="w-full" value={role} onChange={(event) => setRole(event.target.value as UserRole)}><option value="GAKUSEI">{tCommon("roleGakusei")}</option><option value="SENSEI">{tCommon("roleSensei")}</option><option value="TANTOSHA">{tCommon("roleTantosha")}</option></select></div>
              <div><label htmlFor="user-create-cohort" className="mb-1 block text-xs font-medium">{t("modalInitialCohort")}</label><select id="user-create-cohort" name="cohortId" className="w-full" value={selectedCohortId} onChange={(event) => setSelectedCohortId(event.target.value)}><option value="">{t("modalInitialCohortNone")}</option>{cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.code} — {cohort.name}</option>)}</select></div>
            </div>
            <div><label htmlFor="user-create-notes" className="mb-1 block text-xs font-medium">{t("modalNotes")}</label><Input id="user-create-notes" name="notes" placeholder={t("modalNotesPlaceholder")} value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateUserOpen(false)}>{tCommon("cancel")}</Button><Button type="submit">{t("modalSubmit")}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <StudentProfileDrawer student={selectedStudent} open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)} />
    </PageShell>
  )
}
