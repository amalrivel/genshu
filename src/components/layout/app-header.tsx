"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenText, CheckSquare, GraduationCap, Menu, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { LanguageToggle } from "@/components/language-toggle"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { key: "materials", href: "/materials", icon: BookOpenText },
  { key: "practice", href: "/practice", icon: CheckSquare },
  { key: "staff", href: "/staff", icon: GraduationCap },
] as const

export function AppHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const t = useTranslations("nav")
  const tCommon = useTranslations("common")

  React.useEffect(() => {
    const desktop = window.matchMedia("(min-width: 48rem)")
    const closeMobileMenu = () => {
      if (desktop.matches) setMenuOpen(false)
    }

    closeMobileMenu()
    desktop.addEventListener("change", closeMobileMenu)
    return () => desktop.removeEventListener("change", closeMobileMenu)
  }, [])

  const navLink = ({ key, href, icon: Icon }: (typeof links)[number], mobile = false) => {
    const active = pathname === href || pathname.startsWith(`${href}/`)
    return (
      <Link key={href} href={href} onClick={() => mobile && setMenuOpen(false)} aria-current={active ? "page" : undefined} className={cn("nav-link", mobile && "nav-link-mobile", active && "nav-link-active")}>
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span>{t(key)}</span>
      </Link>
    )
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/materials" className="brand-link" aria-label={tCommon("appName")}>
          <span className="brand-mark"><GraduationCap className="size-5" aria-hidden="true" /></span>
          <span className="brand-copy"><span className="brand-name">{tCommon("appName")}</span><span className="brand-subtitle">{tCommon("appSubtitle")}</span></span>
        </Link>
        <nav aria-label={t("primaryNavigation")} className="desktop-nav">{links.map((link) => navLink(link))}</nav>
        <div className="header-actions">
          <div className="flex items-center gap-2"><LanguageToggle /><ModeToggle /></div>
          <Button variant="outline" size="icon" className="mobile-menu-trigger md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? t("closeNavigation") : t("openNavigation")} aria-expanded={menuOpen} aria-controls="mobile-navigation">
            {menuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
          </Button>
        </div>
      </div>
      {menuOpen && <div id="mobile-navigation" className="mobile-navigation"><nav aria-label={t("primaryNavigation")} className="space-y-1">{links.map((link) => navLink(link, true))}</nav></div>}
    </header>
  )
}
