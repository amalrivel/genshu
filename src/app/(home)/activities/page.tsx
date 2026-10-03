import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { activityTypes } from "@/lib/activities/activity-types";

// NOTE: Halaman ini hanya menampilkan pilihan jenis activity.
// Daftar berada di type/[type]; pengerjaan berada di [activityId].
export default function ActivitiesPage() {
  return (
    <section className="space-y-4">
      <header>
        <h1>Activities</h1>
        <p>Choose the type of activity you want to work on.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activityTypes.map((type) => (
          <Link key={type.id} href={`/activities/type/${type.id}`}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{type.title}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
