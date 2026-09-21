import * as React from "react"
import { cn } from "@/lib/utils"

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function PageShell({ children, className, ...props }: PageShellProps) {
  return (
    <div className={cn("page-shell", className)} {...props}>
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  metadata?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, eyebrow, metadata, action, className }: PageHeaderProps) {
  return (
    <header className={cn("page-header", className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
        {metadata && <div className="page-header-metadata">{metadata}</div>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  )
}

interface SectionHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("section-header", className)}>
      <div className="min-w-0">
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
