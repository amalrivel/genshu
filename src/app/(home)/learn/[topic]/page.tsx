// NOTE: Current behavior: navigation reads static Learn fixtures.
// TODO: Correct /learns links to /learn, show readable titles/descriptions and
// breadcrumbs, and handle published content plus empty states.
// See docs/developer-guide.md, Learn.

import { Card, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopic, getSubjectsByTopic } from "@/lib/learn/queries";

export default async function Subjects({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;

  const topicData = getTopic(topic);

  if (!topicData) {
    notFound();
  }

  const subjects = getSubjectsByTopic(topic);

  return (
    <>
      {/* TODO: Show the page title and description from content data. */}
      <section>
        <h2>Topic: {topic}</h2>
        <p></p>
      </section>

      {/* NOTE: Subject selection stays within the selected topic. */}
      <section>
        <h3>subjects</h3>
        <div className=" grid grid-cols-3 gap-4 mt-2">
          {subjects.map((subject, index) => (
            <Link key={index} href={`/learns/${topic}/${subject.id}`}>
              <Card>
                <CardTitle>{subject.title}</CardTitle>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
