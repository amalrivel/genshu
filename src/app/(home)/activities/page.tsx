import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ActivityCard } from "@/components/activities/activity-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { getActivities } from "@/lib/activities/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UI");
  return { title: t("Latihan") };
}

export default async function ActivitiesPage() {
  const t = await getTranslations("UI");

  const activities = await getActivities();
  return (
    <section className="page-stack">
      <header className="page-header">
        <h1>{t("Latihan")}</h1>
        <p>{t("Uji_pemahaman_Anda_Jawaban_disimpan_otomatis_agar_bisa_dilanjutkan_nanti")}</p>
      </header>
      {activities.length ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <CollectionEmpty
          title={t("Belum_ada_latihan")}
          description={t("Latihan_akan_muncul_setelah_diterbitkan_oleh_guru_Anda")}
        />
      )}
    </section>
  );
}
