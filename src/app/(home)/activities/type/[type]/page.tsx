// NOTE: Kategori tidak valid/tidak ada adalah 404, sedangkan kategori tanpa
// Activity adalah keadaan kosong yang normal. Database gagal dibaca adalah
// error operasional dan ditangani boundary; ketiganya perlu dibedakan agar
// pengguna mendapat petunjuk yang benar dan masalah server tidak tersembunyi.

import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityCard } from "@/components/activities/activity-card";
import { getActivityCategory, getActivitiesByType } from "@/lib/activities/queries";

// NOTE: Daftar berdasarkan jenis; URL pengerjaan tidak bergantung pada jenis.
export default async function ActivitiesByTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const activityType = await getActivityCategory(type);
  if (!activityType) notFound();
  const activities = await getActivitiesByType(activityType.id);

  return (
    <section className="space-y-4">
      <Link href="/activities" className="underline">Back to activity types</Link>
      <header>
        <h1>{activityType.title}</h1>
        <p>{activityType.description}</p>
      </header>
      {activities.length === 0 ? (
        <p>No activities available for this type yet.</p>
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
