import type { Metadata } from "next";
import { TopicCard } from "@/components/learn/topic-card";
import { getTopics } from "@/lib/learn/queries";

export const metadata: Metadata = { title: "Learn", description: "Browse published learning materials." };

export default async function LearnPage() {
  const topics = await getTopics();
  return <section className="space-y-5">
    <header><h1 className="text-2xl font-semibold">Learn</h1><p className="text-muted-foreground">Choose a topic to browse its subjects and materials.</p></header>
    {topics.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{topics.map((topic) => <TopicCard key={topic.id} topic={topic} />)}</div> : <p>No published learning topics yet.</p>}
  </section>;
}
