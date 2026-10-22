import type { Metadata } from "next";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { getPublishedAnnouncements } from "@/lib/announcements/queries";

export const metadata: Metadata = { title: "Pengumuman", description: "Kabar terbaru dari guru Genshu." };

export default async function AnnouncementsPage() {
  const announcements = await getPublishedAnnouncements(50);
  return <section className="flex flex-col gap-5">
    <header className="page-header"><h1>Pengumuman</h1><p>Kabar dan informasi terbaru dari guru Anda.</p></header>
    {announcements.length ? <ul className="divide-y border-y">{announcements.map((announcement) => <li key={announcement.id}><AnnouncementCard announcement={announcement} /></li>)}</ul> : <CollectionEmpty title="Belum ada pengumuman" description="Pengumuman dari guru Anda akan muncul di sini." />}
  </section>;
}
