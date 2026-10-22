import type { Metadata } from "next";
import { EventCard } from "@/components/calendar/event-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { getUpcomingEvents } from "@/lib/calendar/queries";

export const metadata: Metadata = { title: "Jadwal", description: "Kelas dan kegiatan mendatang dalam waktu Jepang." };

export default async function CalendarPage() {
  const events = await getUpcomingEvents(100);
  return <section className="flex flex-col gap-5">
    <header className="page-header"><h1>Jadwal</h1><p>Agenda kelas dan kegiatan · Waktu Jepang, Asia/Tokyo (JST).</p></header>
    <h2 className="sr-only">Kelas dan kegiatan mendatang</h2>
    {events.length ? <ol className="divide-y border-y">{events.map((event) => <li key={event.id}><EventCard event={event} /></li>)}</ol> : <CollectionEmpty title="Belum ada jadwal mendatang" description="Jadwal kelas dan kegiatan akan muncul setelah diterbitkan." />}
  </section>;
}
