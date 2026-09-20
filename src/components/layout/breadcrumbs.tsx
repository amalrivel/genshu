"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto py-1 scrollbar-none",
        className
      )}
    >
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        {items.map((item, index) => {
          const isFirst = index === 0
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-1.5">
              {!isFirst && (
                <ChevronRight
                  className="h-3 w-3 shrink-0 text-muted-foreground/50"
                  aria-hidden="true"
                />
              )}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {isFirst && <Home className="h-3.5 w-3.5 shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1",
                    isLast
                      ? "font-medium text-foreground max-w-[200px] sm:max-w-xs md:max-w-md truncate"
                      : "text-muted-foreground"
                  )}
                  title={item.label}
                >
                  {isFirst && <Home className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
