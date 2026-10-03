// NOTE: Halaman ini mengambil dan menampilkan daftar activity.
// State pengerjaan soal berada di runner dan useActivity.
import { ActivityCard } from "@/components/activities/activity-card";
import { getActivities } from "@/lib/activities/queries";


export default async function Activities() {
  const activities = await getActivities();

  return (
    <>
      <section className="space-y-4">
        <header>
          <h1>Activities</h1>
          <p>Choose an activity to start learning and practicing.</p>
        </header>
        {activities.length === 0 ? (
          <p>No activities available yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
