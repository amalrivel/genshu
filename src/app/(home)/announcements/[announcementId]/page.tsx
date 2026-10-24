import { getLocale } from "next-intl/server";

import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { AnnouncementContent } from "@/components/announcements/announcement-content";
import { getPublishedAnnouncement } from "@/lib/announcements/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ announcementId: string }>;
}) {
  const t = await getTranslations("UI");

  const { announcementId } = await params;
  const announcement = await getPublishedAnnouncement(announcementId);
  return announcement
    ? { title: announcement.title, description: announcement.summary }
    : { title: t("Pengumuman_tidak_ditemukan") };
}

export default async function AnnouncementDetail({
  params,
}: {
  params: Promise<{ announcementId: string }>;
}) {
  const locale = await getLocale();

  const t = await getTranslations("UI");

  const { announcementId } = await params;
  const announcement = await getPublishedAnnouncement(announcementId);
  if (!announcement) notFound();
  return (
    <article className="mx-auto w-full max-w-3xl flex flex-col gap-5">
      <Link href="/announcements" className={buttonVariants({ variant: "outline" })}>
        {t("Kembali_ke_pengumuman")}
      </Link>
      <header className="page-header">
        <h1>{announcement.title}</h1>
        {announcement.publishedAt ? (
          <time dateTime={announcement.publishedAt} className="text-sm text-muted-foreground">
            {new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "Asia/Tokyo" }).format(
              new Date(announcement.publishedAt),
            )}{" "}
            {t("JST")}
          </time>
        ) : null}
      </header>
      <p className="font-medium">{announcement.summary}</p>
      <AnnouncementContent content={announcement.content} />
    </article>
  );
}
