import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { AnnouncementContent } from "@/components/announcements/announcement-content";
import { getPublishedAnnouncement } from "@/lib/announcements/queries";

export async function generateMetadata({ params }: { params: Promise<{ announcementId: string }> }) {
  const { announcementId } = await params;
  const announcement = await getPublishedAnnouncement(announcementId);
  return announcement ? { title: announcement.title, description: announcement.summary } : { title: "Pengumuman tidak ditemukan" };
}

export default async function AnnouncementDetail({ params }: { params: Promise<{ announcementId: string }> }) {
  const { announcementId } = await params;
  const announcement = await getPublishedAnnouncement(announcementId);
  if (!announcement) notFound();
  return <article className="mx-auto w-full max-w-3xl flex flex-col gap-5">
    <Link href="/announcements" className={buttonVariants({ variant: "outline" })}>← Kembali ke pengumuman</Link>
    <header className="page-header"><h1>{announcement.title}</h1>
      {announcement.publishedAt ? <time dateTime={announcement.publishedAt} className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Tokyo" }).format(new Date(announcement.publishedAt))} JST</time> : null}
    </header>
    <p className="font-medium">{announcement.summary}</p>
    <AnnouncementContent content={announcement.content} />
  </article>;
}
