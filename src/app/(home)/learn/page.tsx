import type { Metadata } from "next";
import { TopicCard } from "@/components/learn/topic-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { getTopics } from "@/lib/learn/queries";

export const metadata: Metadata = { title: "Belajar", description: "Jelajahi materi belajar yang tersedia." };

export default async function LearnPage() {
  const topics = await getTopics();
  return <section className="flex flex-col gap-5">
    <header className="page-header"><h1>Belajar</h1><p>Pilih topik, temukan materi, lalu belajar sesuai langkah Anda.</p></header>
    {topics.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{topics.map((topic) => <TopicCard key={topic.id} topic={topic} />)}</div> : <CollectionEmpty title="Belum ada topik belajar" description="Topik akan muncul setelah diterbitkan oleh guru Anda." />}
  </section>;
}
