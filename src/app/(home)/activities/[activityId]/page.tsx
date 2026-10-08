// NOTE: Route menangani ID dan menyusun halaman; tidak menyimpan state jawaban.
// Tidak adanya record adalah 404. Kegagalan query dibiarkan menuju error.tsx,
// supaya gangguan database tidak disamarkan sebagai Activity yang tidak tersedia.
// TODO: Saat autentikasi tersedia, periksa izin sebelum mengirim soal ke runner.

// NOTE: Halaman ini mengambil activity berdasarkan ID,
// menangani data yang tidak ditemukan, dan menampilkan runner.

import { notFound } from "next/navigation";

import { ActivityRunner } from "@/components/activities/activity-runner";
import { getActivity } from "@/lib/activities/queries";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{
    activityId: string;
  }>;
}) {
  const { activityId } = await params;

  const activity =
    await getActivity(activityId);

  if (!activity) {
    notFound();
  }

  return (
    <ActivityRunner
      activity={activity}
    />
  );
}
