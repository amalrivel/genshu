import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

const furiganaPattern = /\{([^|{}]+)\|([^{}]+)\}/g

export function FuriganaTokenText({ text, showFurigana = true, className }: {
  text: string
  showFurigana?: boolean
  className?: string
}) {
  const parts: ReactNode[] = []
  let cursor = 0
  let match: RegExpExecArray | null
  let index = 0
  while ((match = furiganaPattern.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index))
    parts.push(<ruby key={index++}>{match[1]}<rt className={cn("text-[0.62em] text-muted-foreground font-normal", !showFurigana && "hidden")}>{match[2]}</rt></ruby>)
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) parts.push(text.slice(cursor))
  return <span className={cn("whitespace-pre-line", className)}>{parts}</span>
}
