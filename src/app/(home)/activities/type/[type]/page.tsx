import { getTranslations } from "next-intl/server";
// NOTE: Kategori tidak valid/tidak ada adalah 404, sedangkan kategori tanpa
// Activity adalah keadaan kosong yang normal. Database gagal dibaca adalah
// error operasional dan ditangani boundary; ketiganya perlu dibedakan agar
// pengguna mendapat petunjuk yang benar dan masalah server tidak tersembunyi.

import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityCard } from "@/components/activities/activity-card";
import { getActivityCategory, getActivitiesByType } from "@/lib/activities/queries";
import { CollectionEmpty } from "@/components/layouts/collection-empty";

// NOTE: Daftar berdasarkan jenis; URL pengerjaan tidak bergantung pada jenis.
export default async function ActivitiesByTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const t = await getTranslations("UI");

  const { type } = await params;
  const activityType = await getActivityCategory(type);
  if (!activityType) notFound();
  const activities = await getActivitiesByType(activityType.id);

  return (
    <section className="flex flex-col gap-4">
      <Link
        href="/activities"
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline"
      >
        {t("Semua_latihan")}
      </Link>
      <header>
        <h1>{activityType.title}</h1>
        <p className="text-muted-foreground">{activityType.description}</p>
      </header>
      {activities.length === 0 ? (
        <CollectionEmpty
          title={t("Belum_ada_latihan")}
          description={t("Latihan_akan_muncul_setelah_diterbitkan_oleh_guru_Anda")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </section>
  );
}
