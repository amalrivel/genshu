import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { getPublishedAnnouncements } from "@/lib/announcements/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UI");
  return {
    title: t("Pengumuman"),
    description: t("Kabar_terbaru_dari_guru_Genshu"),
  };
}

export default async function AnnouncementsPage() {
  const t = await getTranslations("UI");

  const announcements = await getPublishedAnnouncements(50);
  return (
    <section className="flex flex-col gap-5">
      <header className="page-header">
        <h1>{t("Pengumuman")}</h1>
        <p>{t("Kabar_dan_informasi_terbaru_dari_guru_Anda")}</p>
      </header>
      {announcements.length ? (
        <ul className="divide-y border-y">
          {announcements.map((announcement) => (
            <li key={announcement.id}>
              <AnnouncementCard announcement={announcement} />
            </li>
          ))}
        </ul>
      ) : (
        <CollectionEmpty
          title={t("Belum_ada_pengumuman")}
          description={t("Pengumuman_dari_guru_Anda_akan_muncul_di_sini")}
        />
      )}
    </section>
  );
}
