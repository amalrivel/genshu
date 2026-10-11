import type { Metadata } from "next";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { getPublishedAnnouncements } from "@/lib/announcements/queries";

export const metadata: Metadata = { title: "Announcements", description: "Updates from your Genshu teachers." };

export default async function AnnouncementsPage() {
  const announcements = await getPublishedAnnouncements(50);
  return <section className="space-y-5">
    <header><h1 className="text-2xl font-semibold">Announcements</h1><p className="text-muted-foreground">Updates from your teachers.</p></header>
    {announcements.length ? <div className="space-y-3">{announcements.map((announcement) => <AnnouncementCard key={announcement.id} announcement={announcement} />)}</div> : <p>No announcements have been published yet.</p>}
  </section>;
}
