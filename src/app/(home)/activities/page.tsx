import type { Metadata } from "next";
import { ActivityCard } from "@/components/activities/activity-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { getActivities } from "@/lib/activities/queries";

export const metadata: Metadata = { title: "Latihan" };

export default async function ActivitiesPage() {
  const activities = await getActivities();
  return <section className="page-stack">
    <header className="page-header"><h1>Latihan</h1><p>Uji pemahaman Anda. Jawaban disimpan otomatis agar bisa dilanjutkan nanti.</p></header>
    {activities.length ? <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}</div> : <CollectionEmpty title="Belum ada latihan" description="Latihan akan muncul setelah diterbitkan oleh guru Anda." />}
  </section>;
}
