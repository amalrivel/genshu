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
      {/* 
    NOTE: Title and a little word about this page.
    */}
      <section>
        <h2>Topic: {topic}</h2>
        <p></p>
      </section>

      {/* 
      NOTE: subjects are can chosen with a little bit word of explanation.
      */}
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
