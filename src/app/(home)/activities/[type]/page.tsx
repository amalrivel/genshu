// NOTE: Halaman ini mengambil activity berdasarkan ID,
// menangani data yang tidak ditemukan, dan menampilkan runner.


import { notFound } from "next/navigation";

import { ActivityRunner } from "@/components/activities/activity-runner";
import { getActivity } from "@/lib/activities/queries";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const activity =
    await getActivity(id);

  if (!activity) {
    notFound();
  }

  return (
    <ActivityRunner
      activity={activity}
    />
  );
}
