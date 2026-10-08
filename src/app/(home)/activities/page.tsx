// NOTE: Database adalah sumber label kategori; konstanta hanya nilai awal seed.
// Enum membatasi jenis yang benar-benar didukung aplikasi. Menambah label di
// database saja tidak menciptakan aturan baru untuk jenis pengerjaan tersebut.

import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivityCategories } from "@/lib/activities/queries";

// NOTE: Halaman ini hanya menampilkan pilihan jenis activity.
// Daftar berada di type/[type]; pengerjaan berada di [activityId].
export default async function ActivitiesPage() {
  const activityTypes = await getActivityCategories();
  return (
    <section className="space-y-4">
      <header>
        <h1>Activities</h1>
        <p>Choose the type of activity you want to work on.</p>
      </header>
      {activityTypes.length === 0 ? (
        <p>No activity types available yet.</p>
      ) : (
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
      )}
    </section>
  );
}
