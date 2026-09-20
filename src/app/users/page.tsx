"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  Users,
  UserPlus,
  Search,
  Mail,
  GraduationCap,
  ShieldCheck,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useData } from "@/lib/data-context"
import { type UserRole, type User } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { StudentProfileDrawer } from "@/components/student-profile-drawer"

export default function UsersPage() {
  const t = useTranslations("users")
  const tCommon = useTranslations("common")
  const tNav = useTranslations("nav")

  const { users, cohorts, currentRole, addUser, getUserCohorts } = useData()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<"ALL" | UserRole>("ALL")
  const [selectedStudent, setSelectedStudent] = React.useState<User | null>(null)
  const [createUserOpen, setCreateUserOpen] = React.useState(false)

  // Form state for creating user
  const [name, setName] = React.useState("")
  const [japaneseName, setJapaneseName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<UserRole>("GAKUSEI")
  const [selectedCohortId, setSelectedCohortId] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [formError, setFormError] = React.useState("")

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.japaneseName && u.japaneseName.includes(searchQuery)) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.notes && u.notes.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Role Counts
  const gakuseiCount = users.filter((u) => u.role === "GAKUSEI").length
  const senseiCount = users.filter((u) => u.role === "SENSEI").length
  const tantoshaCount = users.filter((u) => u.role === "TANTOSHA").length

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setFormError(t("errorName"))
      return
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError(t("errorEmail"))
      return
    }
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
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

    // Reset & close
    setName("")
    setJapaneseName("")
    setEmail("")
    setSelectedCohortId("")
    setNotes("")
    setFormError("")
    setCreateUserOpen(false)
  }

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case "GAKUSEI":
        return (
          <Badge variant="roleGakusei" className="gap-1 text-xs">
            <GraduationCap className="h-3 w-3" />
            {tNav("roleGakuseiDesc")}
          </Badge>
        )
      case "SENSEI":
        return (
          <Badge variant="roleSensei" className="gap-1 text-xs">
            <Users className="h-3 w-3" />
            {tNav("roleSenseiDesc")}
          </Badge>
        )
      case "TANTOSHA":
        return (
          <Badge variant="roleTantosha" className="gap-1 text-xs">
            <ShieldCheck className="h-3 w-3" />
            {tNav("roleTantoshaDesc")}
          </Badge>
        )
    }
  }

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <Badge variant="outline" className="text-xs font-normal">
              {t("badge")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("desc")}
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => {
              setFormError("")
              setCreateUserOpen(true)
            }}
            className="gap-2 shadow-xs sm:self-start"
          >
            <UserPlus className="h-4 w-4" />
            {t("addUser")}
          </Button>
        )}
      </div>

      {/* Role Counts Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          onClick={() => setRoleFilter("ALL")}
          className={cn(
            "rounded-xl border p-4 text-left transition-all",
            roleFilter === "ALL"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-border/70 bg-card hover:border-border"
          )}
        >
          <p className="text-xs text-muted-foreground font-medium">{t("cardTotal")}</p>
          <p className="mt-1 text-2xl font-bold">{t("countUnit", { count: users.length })}</p>
        </button>

        <button
          onClick={() => setRoleFilter("GAKUSEI")}
          className={cn(
            "rounded-xl border p-4 text-left transition-all",
            roleFilter === "GAKUSEI"
              ? "border-indigo-500 bg-indigo-500/5 shadow-xs"
              : "border-border/70 bg-card hover:border-border"
          )}
        >
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{t("cardGakusei")}</p>
          <p className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-300">{t("countUnit", { count: gakuseiCount })}</p>
        </button>

        <button
          onClick={() => setRoleFilter("SENSEI")}
          className={cn(
            "rounded-xl border p-4 text-left transition-all",
            roleFilter === "SENSEI"
              ? "border-emerald-500 bg-emerald-500/5 shadow-xs"
              : "border-border/70 bg-card hover:border-border"
          )}
        >
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t("cardSensei")}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{t("countUnit", { count: senseiCount })}</p>
        </button>

        <button
          onClick={() => setRoleFilter("TANTOSHA")}
          className={cn(
            "rounded-xl border p-4 text-left transition-all",
            roleFilter === "TANTOSHA"
              ? "border-purple-500 bg-purple-500/5 shadow-xs"
              : "border-border/70 bg-card hover:border-border"
          )}
        >
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t("cardTantosha")}</p>
          <p className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-300">{t("countUnit", { count: tantoshaCount })}</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={t("searchPlaceholder")}
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        <div className="text-xs text-muted-foreground self-center">
          {t("showingCount", { count: filteredUsers.length })}
        </div>
      </div>

      {/* Users Table / List */}
      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="mt-4 text-base font-semibold">{t("noUsersFound")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("noUsersDesc")}
          </p>
        </div>
      ) : (
        <div className="surface-section overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">{t("colName")}</th>
                  <th className="py-3.5 px-4">{t("colRole")}</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">{t("colEmail")}</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">{t("colCohorts")}</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">{t("colNotes")}</th>
                  <th className="py-3.5 px-4 hidden xl:table-cell">{t("colJoined")}</th>
                  <th className="py-3.5 px-4 text-right">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((user) => {
                  const userCohorts = getUserCohorts(user.id)
                  const initials = user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shrink-0",
                              user.role === "GAKUSEI" && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                              user.role === "SENSEI" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                              user.role === "TANTOSHA" && "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            )}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {user.name}
                            </div>
                            {user.japaneseName && (
                              <div className="text-xs text-muted-foreground">
                                {user.japaneseName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 hidden sm:table-cell text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 shrink-0" />
                          {user.email}
                        </span>
                      </td>

                      {/* Cohort Chips */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs">
                        {userCohorts.length === 0 ? (
                          <span className="text-muted-foreground italic text-[0.75rem]">
                            {t("noCohort")}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {userCohorts.map((c) => (
                              <Link key={c.id} href={`/cohorts/${c.id}`}>
                                <Badge
                                  variant="outline"
                                  className="text-[0.68rem] py-0 px-1.5 hover:bg-muted font-mono"
                                >
                                  {c.code}
                                </Badge>
                              </Link>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-muted-foreground">
                        {user.notes || "—"}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 hidden xl:table-cell text-xs text-muted-foreground">
                        {user.joinedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {user.role === "GAKUSEI" && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setSelectedStudent(user)}
                            className="text-xs gap-1 hover:bg-muted font-medium text-foreground/80 hover:text-foreground"
                          >
                            <FileText className="h-3 w-3 text-indigo-500" />
                            {tCommon("viewProgress")}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("modalTitle")}</DialogTitle>
            <DialogDescription>
              {t("modalDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
            {formError && (
              <div role="alert" aria-live="polite" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1">
                {t("modalName")}
              </label>
              <Input
                placeholder={t("modalNamePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                {t("modalNameKana")}
              </label>
              <Input
                placeholder={t("modalNameKanaPlaceholder")}
                value={japaneseName}
                onChange={(e) => setJapaneseName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                {t("modalEmail")}
              </label>
              <Input
                type="email"
                placeholder="budi.setiawan@student.genshu.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  {t("modalRole")}
                </label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="GAKUSEI">{tNav("roleGakuseiDesc")}</option>
                  <option value="SENSEI">{tNav("roleSenseiDesc")}</option>
                  <option value="TANTOSHA">{tNav("roleTantoshaDesc")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  {t("modalInitialCohort")}
                </label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={selectedCohortId}
                  onChange={(e) => setSelectedCohortId(e.target.value)}
                >
                  <option value="">{t("modalInitialCohortNone")}</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name.substring(0, 16)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                {t("modalNotes")}
              </label>
              <Input
                placeholder={t("modalNotesPlaceholder")}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateUserOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit">{t("modalSubmit")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Profile Overview Drawer */}
      <StudentProfileDrawer
        student={selectedStudent}
        open={!!selectedStudent}
        onOpenChange={(open) => !open && setSelectedStudent(null)}
      />
    </div>
  )
}
