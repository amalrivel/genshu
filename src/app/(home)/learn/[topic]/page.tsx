import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SubjectCard } from "@/components/learn/subject-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { getTopic, getSubjectsByTopic } from "@/lib/learn/queries";

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const t = await getTranslations("UI");

  const { topic: id } = await params;
  const topic = await getTopic(id);
  if (!topic) notFound();
  const subjects = await getSubjectsByTopic(id);
  return (
    <section className="flex flex-col gap-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/learn" />}>{t("Belajar")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{topic.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="page-header">
        <h1>{topic.title}</h1>
        <p>{topic.description}</p>
      </header>
      {subjects.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} topicId={id} subject={subject} />
          ))}
        </div>
      ) : (
        <CollectionEmpty
          title={t("Belum_ada_subjek")}
          description={t("Guru_Anda_belum_menerbitkan_subjek_untuk_topik_ini")}
        />
      )}
    </section>
  );
}
