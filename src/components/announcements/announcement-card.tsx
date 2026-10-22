import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function AnnouncementCard({ announcement }: { announcement: { id: string; title: string; summary: string; publishedAt: string | null } }) {
  return <Link href={`/announcements/${announcement.id}`} className="flex min-h-20 items-start justify-between gap-4 rounded-md px-4 py-4 transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2">
    <span className="min-w-0 flex flex-col gap-1">
      <span className="block break-words font-semibold">{announcement.title}</span>
      {announcement.publishedAt ? <time dateTime={announcement.publishedAt} className="block text-sm text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Tokyo" }).format(new Date(announcement.publishedAt))}</time> : null}
      <span className="block break-words text-sm text-muted-foreground">{announcement.summary}</span>
    </span>
    <ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground" />
  </Link>;
}
