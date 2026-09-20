import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/15 text-destructive border-destructive/20",
        outline: "text-foreground border-border",
        success:
          "border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
        warning:
          "border-amber-500/20 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
        info: "border-sky-500/20 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
        roleGakusei:
          "border-indigo-500/25 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
        roleSensei:
          "border-emerald-500/25 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
        roleTantosha:
          "border-purple-500/25 bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
