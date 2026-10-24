import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { RecordingCard } from "@/components/recordings/recording-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { getPublishedRecordings } from "@/lib/recordings/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UI");
  return {
    title: t("Rekaman_kelas"),
    description: t("Rekaman_kelas_untuk_dipelajari_kembali"),
  };
}

export default async function RecordingPage() {
  const t = await getTranslations("UI");

  const recordings = await getPublishedRecordings();
  return (
    <section className="flex flex-col gap-5">
      <header className="page-header">
        <h1>{t("Rekaman_kelas")}</h1>
        <p>{t("Pelajari_kembali_kelas_Anda_Rekaman_dibuka_melalui_penyedia_video_eksternal")}</p>
      </header>
      {recordings.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {recordings.map((recording) => (
            <RecordingCard key={recording.id} recording={recording} />
          ))}
        </div>
      ) : (
        <CollectionEmpty
          title={t("Belum_ada_rekaman_kelas")}
          description={t("Rekaman_akan_muncul_setelah_diterbitkan_oleh_guru_Anda")}
        />
      )}
    </section>
  );
}
