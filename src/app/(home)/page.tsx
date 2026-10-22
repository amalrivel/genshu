import type { Metadata } from "next";
export const metadata: Metadata = { title: "Beranda" };
import { HomeDashboard } from "@/components/home/home-dashboard";
import { requireUser } from "@/lib/auth-session";
import { getPublishedAnnouncements } from "@/lib/announcements/queries";
import { getUpcomingEvents } from "@/lib/calendar/queries";
import { getRecentResults, getLatestOpenAttempt } from "@/lib/activities/queries";

export default async function HomePage() {
  const session = await requireUser();
  const [announcements, events, recentPractice, openAttempt] = await Promise.all([
    getPublishedAnnouncements(3),
    getUpcomingEvents(3),
    getRecentResults(session.user.id, 5),
    getLatestOpenAttempt(session.user.id),
  ]);
  return <HomeDashboard name={session.user.name} openAttempt={openAttempt} announcements={announcements} events={events} recentPractice={recentPractice} />;
}
