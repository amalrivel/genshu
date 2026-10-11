import { HomeDashboard } from "@/components/home/home-dashboard";
import { requireUser } from "@/lib/auth-session";
import { getPublishedAnnouncements } from "@/lib/announcements/queries";
import { getUpcomingEvents } from "@/lib/calendar/queries";
import { getRecentResults } from "@/lib/activities/queries";

export default async function HomePage() {
  const session = await requireUser();
  const [announcements, events, recentPractice] = await Promise.all([
    getPublishedAnnouncements(3),
    getUpcomingEvents(3),
    getRecentResults(session.user.id, 5),
  ]);
  return <HomeDashboard announcements={announcements} events={events} recentPractice={recentPractice} />;
}
