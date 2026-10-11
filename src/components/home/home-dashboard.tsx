import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { EventCard } from "@/components/calendar/event-card";

type Announcement = { id: string; title: string; summary: string; publishedAt: string | null };
type Event = { id: string; title: string; details: string; startsAt: string; endsAt: string };
type RecentPractice = { id: string; activityId: string; activityTitle: string; result: unknown; submittedAt: string | null };

export function HomeDashboard({ announcements, events, recentPractice }: { announcements: Announcement[]; events: Event[]; recentPractice: RecentPractice[] }) {
  return <div className="space-y-8">
    <section className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-semibold">Welcome to Genshu</h1><p className="text-muted-foreground">Pick up where you left off.</p></div>
      <div className="flex gap-2"><Link className={buttonVariants()} href="/learn">Browse Learn</Link><Link className={buttonVariants({ variant: "outline" })} href="/activities">Practice</Link></div>
    </section>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Announcements</CardTitle></CardHeader><CardContent className="space-y-3">
        {announcements.length ? announcements.map((item) => <AnnouncementCard key={item.id} announcement={item} />) : <p>No new announcements.</p>}
        <Link href="/announcements" className="inline-block underline">All announcements</Link>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Upcoming events</CardTitle><p className="text-sm text-muted-foreground">Times in Asia/Tokyo (JST).</p></CardHeader><CardContent className="space-y-3">
        {events.length ? events.map((event) => <EventCard key={event.id} event={event} />) : <p>No upcoming events.</p>}
        <Link href="/calendar" className="inline-block underline">Open calendar</Link>
      </CardContent></Card>
    </div>
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Recent practice</h2>
      {recentPractice.length ? <ul className="space-y-2">{recentPractice.map((attempt) => {
        const score = attempt.result && typeof attempt.result === "object" && "score" in attempt.result && typeof attempt.result.score === "number" ? attempt.result.score : null;
        return <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-4">
          <Link href={`/activities/${attempt.activityId}?attempt=${attempt.id}`} className="font-medium underline">{attempt.activityTitle}</Link>
          <span>{score === null ? "Saved result" : `${score}%`}</span>
          {attempt.submittedAt ? <time dateTime={attempt.submittedAt} className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "Asia/Tokyo" }).format(new Date(attempt.submittedAt))}</time> : null}
        </li>;
      })}</ul> : <p>You have no completed practice yet.</p>}
      <Link href="/activities" className="inline-block underline">View practice</Link>
    </section>
  </div>;
}
