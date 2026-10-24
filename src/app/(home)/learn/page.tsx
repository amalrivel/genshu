import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { TopicCard } from "@/components/learn/topic-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { getTopics } from "@/lib/learn/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UI");
  return {
    title: t("Belajar"),
    description: t("Jelajahi_materi_belajar_yang_tersedia"),
  };
}

export default async function LearnPage() {
  const t = await getTranslations("UI");

  const topics = await getTopics();
  return (
    <section className="flex flex-col gap-5">
      <header className="page-header">
        <h1>{t("Belajar")}</h1>
        <p>{t("Pilih_topik_temukan_materi_lalu_belajar_sesuai_langkah_Anda")}</p>
      </header>
      {topics.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      ) : (
        <CollectionEmpty
          title={t("Belum_ada_topik_belajar")}
          description={t("Topik_akan_muncul_setelah_diterbitkan_oleh_guru_Anda")}
        />
      )}
    </section>
  );
}
