import type { Metadata } from "next";
import { EventCard } from "@/components/calendar/event-card";
import { getUpcomingEvents } from "@/lib/calendar/queries";

export const metadata: Metadata = { title: "Calendar", description: "Upcoming lessons and events in Japan Standard Time." };

export default async function CalendarPage() {
  const events = await getUpcomingEvents(100);
  return <section className="space-y-5">
    <header><h1 className="text-2xl font-semibold">Calendar</h1><p className="text-muted-foreground">All times are shown in Asia/Tokyo (JST).</p></header>
    {events.length ? <ol className="space-y-3">{events.map((event) => <li key={event.id}><EventCard event={event} /></li>)}</ol> : <p>No upcoming lessons or events.</p>}
  </section>;
}
