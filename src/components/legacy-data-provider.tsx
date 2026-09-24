"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { DataProvider } from "@/lib/data-context"

export function LegacyDataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isPublishedLearning = pathname === "/materials" || pathname.startsWith("/materials/") || pathname === "/practice" || pathname.startsWith("/practice/")
  return isPublishedLearning ? children : <DataProvider>{children}</DataProvider>
}
