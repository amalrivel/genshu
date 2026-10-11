import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnnouncementCard({ announcement }: { announcement: { id: string; title: string; summary: string; publishedAt: string | null } }) {
  return <Card>
    <CardHeader>
      <CardTitle><Link className="underline-offset-4 hover:underline" href={`/announcements/${announcement.id}`}>{announcement.title}</Link></CardTitle>
      {announcement.publishedAt ? <time dateTime={announcement.publishedAt} className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "Asia/Tokyo" }).format(new Date(announcement.publishedAt))}</time> : null}
    </CardHeader>
    <CardContent><p>{announcement.summary}</p></CardContent>
  </Card>;
}
