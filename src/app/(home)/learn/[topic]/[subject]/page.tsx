import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChapterNavigation } from "@/components/learn/chapter-navigation";
import { MaterialContent } from "@/components/learn/material-content";
import { renderLessonHtml } from "@/lib/learn/render";
import { getMaterial } from "@/lib/learn/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string; subject: string }>;
}) {
  const t = await getTranslations("UI");

  const { topic, subject } = await params;
  const material = await getMaterial(topic, subject);
  return material
    ? { title: material.title, description: material.description }
    : { title: t("Materi_tidak_ditemukan") };
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ topic: string; subject: string }>;
}) {
  const t = await getTranslations("UI");

  const { topic, subject } = await params;
  const material = await getMaterial(topic, subject);
  if (!material) notFound();
  const { chapters } = renderLessonHtml(material.contentHtml);
  return (
    <section className="flex flex-col gap-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/learn" />}>{t("Belajar")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={`/learn/${encodeURIComponent(topic)}`} />}>
              {material.topic.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{material.subject.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="page-header">
        <h1>{material.title}</h1>
        <p>{material.description}</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="order-2 min-w-0 lg:order-1">
          <MaterialContent html={material.contentHtml} />
        </div>
        <div className="order-1 lg:order-2">
          <ChapterNavigation chapters={chapters} />
        </div>
      </div>
    </section>
  );
}
