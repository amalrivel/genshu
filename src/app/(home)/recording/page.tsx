import type { Metadata } from "next";
import { RecordingCard } from "@/components/recordings/recording-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { getPublishedRecordings } from "@/lib/recordings/queries";

export const metadata: Metadata = { title: "Rekaman kelas", description: "Rekaman kelas untuk dipelajari kembali." };

export default async function RecordingPage() {
  const recordings = await getPublishedRecordings();
  return <section className="flex flex-col gap-5">
    <header className="page-header"><h1>Rekaman kelas</h1><p>Pelajari kembali kelas Anda. Rekaman dibuka melalui penyedia video eksternal.</p></header>
    {recordings.length ? <div className="grid gap-4 sm:grid-cols-2">{recordings.map((recording) => <RecordingCard key={recording.id} recording={recording} />)}</div> : <CollectionEmpty title="Belum ada rekaman kelas" description="Rekaman akan muncul setelah diterbitkan oleh guru Anda." />}
  </section>;
}
