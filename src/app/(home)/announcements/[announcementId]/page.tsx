import Link from "next/link";
import { notFound } from "next/navigation";
import { AnnouncementContent } from "@/components/announcements/announcement-content";
import { getPublishedAnnouncement } from "@/lib/announcements/queries";

export async function generateMetadata({ params }: { params: Promise<{ announcementId: string }> }) {
  const { announcementId } = await params;
  const announcement = await getPublishedAnnouncement(announcementId);
  return announcement ? { title: announcement.title, description: announcement.summary } : { title: "Announcement not found" };
}

export default async function AnnouncementDetail({ params }: { params: Promise<{ announcementId: string }> }) {
  const { announcementId } = await params;
  const announcement = await getPublishedAnnouncement(announcementId);
  if (!announcement) notFound();
  return <article className="mx-auto w-full max-w-3xl space-y-5">
    <Link href="/announcements" className="underline">Back to announcements</Link>
    <header><h1 className="text-2xl font-semibold">{announcement.title}</h1>
      {announcement.publishedAt ? <time dateTime={announcement.publishedAt} className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "Asia/Tokyo" }).format(new Date(announcement.publishedAt))} JST</time> : null}
    </header>
    <p className="font-medium">{announcement.summary}</p>
    <AnnouncementContent content={announcement.content} />
  </article>;
}
