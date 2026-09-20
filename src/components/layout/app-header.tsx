"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Award,
  BookOpen,
  CalendarCheck,
  Check,
  CheckSquare,
  ChevronDown,
  FileCheck2,
  GraduationCap,
  Layers,
  Menu,
  MoreHorizontal,
  RotateCcw,
  Settings2,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useData } from "@/lib/data-context"
import { type UserRole } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

const primaryItems = [
  { key: "dashboard", href: "/", icon: BookOpen },
  { key: "attendance", href: "/attendance", icon: CalendarCheck },
  { key: "practice", href: "/practice", icon: CheckSquare },
  { key: "assignments", href: "/assignments", icon: FileCheck2 },
  { key: "exams", href: "/exams", icon: Award },
] as const

const managementItems = [
  { key: "cohorts", href: "/cohorts", icon: Layers },
  { key: "users", href: "/users", icon: Users },
] as const

type NavItem = (typeof primaryItems)[number] | (typeof managementItems)[number]

export function AppHeader() {
  const pathname = usePathname()
  const { currentRole, setCurrentRole, resetToDefaults } = useData()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const t = useTranslations("nav")
  const tCommon = useTranslations("common")

  const roleNameMap: Record<UserRole, string> = {
    TANTOSHA: t("roleTantosha"),
    SENSEI: t("roleSensei"),
    GAKUSEI: t("roleGakusei"),
  }

  const roleBadgeVariants: Record<UserRole, "roleTantosha" | "roleSensei" | "roleGakusei"> = {
    TANTOSHA: "roleTantosha",
    SENSEI: "roleSensei",
    GAKUSEI: "roleGakusei",
  }

  const isActive = (href: string) => href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href))
  const managementActive = managementItems.some((item) => isActive(item.href))
  const navLabel = (key: NavItem["key"]) => t(key)

  const renderNavLink = (item: NavItem, mobile = false) => {
    const Icon = item.icon
    const active = isActive(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => mobile && setMobileMenuOpen(false)}
        aria-current={active ? "page" : undefined}
        className={cn("nav-link", mobile && "nav-link-mobile", active && "nav-link-active")}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span>{navLabel(item.key)}</span>
      </Link>
    )
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/" className="brand-link" aria-label={tCommon("appName")}>
          <span className="brand-mark"><GraduationCap className="size-5" aria-hidden="true" /></span>
          <span className="brand-copy">
            <span className="brand-name">{tCommon("appName")}</span>
            <span className="brand-subtitle">{tCommon("appSubtitle")}</span>
          </span>
        </Link>

        <nav aria-label={t("primaryNavigation")} className="desktop-nav">
          {primaryItems.map((item) => renderNavLink(item))}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<button className={cn("nav-link", managementActive && "nav-link-active")} aria-expanded={managementActive} />}
            >
              <Settings2 className="size-4" aria-hidden="true" />
              <span>{t("management")}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t("management")}</DropdownMenuLabel>
                {managementItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href} className="block">
                      <DropdownMenuItem className="gap-2">
                        <Icon className="size-4" aria-hidden="true" />
                        {navLabel(item.key)}
                      </DropdownMenuItem>
                    </Link>
                  )
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="header-actions">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" className="utility-trigger" aria-label={t("openUtilities")} />}
            >
              <Badge variant={roleBadgeVariants[currentRole]} className="utility-role-badge">{roleNameMap[currentRole]}</Badge>
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t("roleView")}</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={currentRole} onValueChange={(value) => setCurrentRole(value as UserRole)}>
                  {(["TANTOSHA", "SENSEI", "GAKUSEI"] as UserRole[]).map((role) => (
                    <DropdownMenuRadioItem key={role} value={role} className="gap-2">
                      <span className={cn("role-dot", `role-dot-${role.toLowerCase()}`)} />
                      {roleNameMap[role]}
                      {role === currentRole && <Check className="ml-auto size-3.5" aria-hidden="true" />}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t("preferences")}</DropdownMenuLabel>
                <div className="flex items-center justify-between px-1.5 py-1.5 text-sm">
                  <span>{t("toggleLang")}</span>
                  <LanguageToggle />
                </div>
                <div className="flex items-center justify-between px-1.5 py-1.5 text-sm">
                  <span>{t("toggleTheme")}</span>
                  <ModeToggle />
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-1.5 py-2 text-sm text-destructive outline-none hover:bg-destructive/10 focus-visible:bg-destructive/10"
                onClick={() => {
                  if (confirm(t("resetConfirm"))) resetToDefaults()
                }}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                {t("resetData")}
              </button>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            className="mobile-menu-trigger"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? t("closeNavigation") : t("openNavigation")}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-navigation" className="mobile-navigation">
          <nav aria-label={t("primaryNavigation")} className="space-y-1">
            <p className="mobile-nav-label">{t("learning")}</p>
            {primaryItems.map((item) => renderNavLink(item, true))}
            <p className="mobile-nav-label pt-3">{t("management")}</p>
            {managementItems.map((item) => renderNavLink(item, true))}
          </nav>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">{t("roleView")}</span>
            <Badge variant={roleBadgeVariants[currentRole]}>{roleNameMap[currentRole]}</Badge>
          </div>
        </div>
      )}
    </header>
  )
}
