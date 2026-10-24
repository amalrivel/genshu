import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { EventCard } from "@/components/calendar/event-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { getUpcomingEvents } from "@/lib/calendar/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UI");
  return {
    title: t("Jadwal"),
    description: t("Kelas_dan_kegiatan_mendatang_dalam_waktu_Jepang"),
  };
}

export default async function CalendarPage() {
  const t = await getTranslations("UI");

  const events = await getUpcomingEvents(100);
  return (
    <section className="flex flex-col gap-5">
      <header className="page-header">
        <h1>{t("Jadwal")}</h1>
        <p>{t("Agenda_kelas_dan_kegiatan_Waktu_Jepang_Asia_Tokyo_JST")}</p>
      </header>
      <h2 className="sr-only">{t("Kelas_dan_kegiatan_mendatang")}</h2>
      {events.length ? (
        <ol className="divide-y border-y">
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ol>
      ) : (
        <CollectionEmpty
          title={t("Belum_ada_jadwal_mendatang")}
          description={t("Jadwal_kelas_dan_kegiatan_akan_muncul_setelah_diterbitkan")}
        />
      )}
    </section>
  );
}
