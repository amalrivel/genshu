import type { Metadata } from "next";
import { RecordingCard } from "@/components/recordings/recording-card";
import { getPublishedRecordings } from "@/lib/recordings/queries";

export const metadata: Metadata = { title: "Class recordings", description: "Published lesson recording links." };

export default async function RecordingPage() {
  const recordings = await getPublishedRecordings();
  return <section className="space-y-5">
    <header><h1 className="text-2xl font-semibold">Class recordings</h1><p className="text-muted-foreground">Videos open on their provider’s site. The provider controls playback access.</p></header>
    {recordings.length ? <div className="grid gap-4 sm:grid-cols-2">{recordings.map((recording) => <RecordingCard key={recording.id} recording={recording} />)}</div> : <p>No class recordings have been published yet.</p>}
  </section>;
}
