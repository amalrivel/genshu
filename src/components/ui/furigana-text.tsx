import * as React from "react"
import { cn } from "@/lib/utils"

export interface FuriganaTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  html?: string
  text?: string
  showFurigana?: boolean
}

export function FuriganaText({
  html,
  text,
  showFurigana = true,
  className,
  ...props
}: FuriganaTextProps) {
  const raw = html || text || ""

  // Transform bracketed furigana syntax {Kanji|furigana} into <ruby>Kanji<rt>furigana</rt></ruby>
  const processed = React.useMemo(() => {
    let result = raw.replace(/\{([^|]+)\|([^}]+)\}/g, "<ruby>$1<rt>$2</rt></ruby>")
    result = result.replace(/\n/g, "<br />")
    return result
  }, [raw])

  // If processed doesn't contain ruby or br, render directly
  if (!processed.includes("<ruby>") && !processed.includes("<br />")) {
    return (
      <span className={className} {...props}>
        {raw}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline font-medium tracking-wide",
        // When showFurigana is false, hide all <rt> elements inside <ruby>
        !showFurigana && "[&_rt]:hidden",
        showFurigana && "[&_rt]:text-[0.62em] [&_rt]:text-muted-foreground [&_rt]:font-normal",
        className
      )}
      dangerouslySetInnerHTML={{ __html: processed }}
      {...props}
    />
  )
}
