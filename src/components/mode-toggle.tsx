"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("nav")

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      title={t("toggleTheme")}
      aria-label={t("toggleTheme")}
      className="relative overflow-hidden"
    >
      <Sun className="h-[1.15rem] w-[1.15rem] scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90 text-amber-500 dark:text-foreground" />
      <Moon className="absolute h-[1.15rem] w-[1.15rem] scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0 text-sky-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
