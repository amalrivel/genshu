import Link from "next/link";
import { notFound } from "next/navigation";
import { SubjectCard } from "@/components/learn/subject-card";
import { getTopic, getSubjectsByTopic } from "@/lib/learn/queries";

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: id } = await params;
  const topic = await getTopic(id);
  if (!topic) notFound();
  const subjects = await getSubjectsByTopic(id);
  return <section className="space-y-5">
    <nav aria-label="Breadcrumb"><ol className="flex flex-wrap gap-2 text-sm"><li><Link href="/learn" className="underline">Learn</Link></li><li aria-hidden="true">/</li><li aria-current="page">{topic.title}</li></ol></nav>
    <header><h1 className="text-2xl font-semibold">{topic.title}</h1><p className="text-muted-foreground">{topic.description}</p></header>
    {subjects.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{subjects.map((subject) => <SubjectCard key={subject.id} topicId={id} subject={subject} />)}</div> : <p>No published materials in this topic yet.</p>}
  </section>;
}
