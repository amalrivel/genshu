import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterNavigation } from "@/components/learn/chapter-navigation";
import { MaterialContent } from "@/components/learn/material-content";
import { renderLessonHtml } from "@/lib/learn/render";
import { getMaterial } from "@/lib/learn/queries";

export async function generateMetadata({ params }: { params: Promise<{ topic: string; subject: string }> }) {
  const { topic, subject } = await params;
  const material = await getMaterial(topic, subject);
  return material ? { title: material.title, description: material.description } : { title: "Material not found" };
}

export default async function MaterialPage({ params }: { params: Promise<{ topic: string; subject: string }> }) {
  const { topic, subject } = await params;
  const material = await getMaterial(topic, subject);
  if (!material) notFound();
  const { chapters } = renderLessonHtml(material.contentHtml);
  return <section className="space-y-5">
    <nav aria-label="Breadcrumb"><ol className="flex flex-wrap gap-2 text-sm">
      <li><Link href="/learn" className="underline">Learn</Link></li><li aria-hidden="true">/</li>
      <li><Link href={`/learn/${encodeURIComponent(topic)}`} className="underline">{material.topic.title}</Link></li><li aria-hidden="true">/</li>
      <li aria-current="page">{material.subject.title}</li>
    </ol></nav>
    <header><h1 className="text-2xl font-semibold">{material.title}</h1><p className="text-muted-foreground">{material.description}</p></header>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <MaterialContent html={material.contentHtml} />
      <ChapterNavigation chapters={chapters} />
    </div>
  </section>;
}
