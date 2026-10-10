
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";

import { getMaterial } from "@/lib/learn/queries";

export default async function Material({
  params,
}: {
  params: Promise<{
    topic: string;
    subject: string;
  }>;
}) {
  const { topic, subject } = await params;

  const material = getMaterial(topic, subject);

  if (!material) {
    notFound();
  }

  return (
    <>
      <section>
        <h1>Topic: {topic}</h1>
        <h2>Subject: {subject}</h2>
      </section>

      {/* NOTE: The material is checked above, but this page still renders placeholders.
          TODO: Render reviewed, published lesson content with readable titles and
          breadcrumbs. Word import must preserve furigana and warn before publication.
          See docs/developer-guide.md, Learn. */}
      <section className="grid  grid-cols-4 gap-4">
        {/* TODO: Render material content; reserve skeletons for actual loading. */}
        <div className="flex flex-col gap-2 col-span-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* TODO: Use an aside with chapter links generated from material headings;
            provide stable anchors and a usable narrow-screen layout. */}
        <Card className="p-4">
          <p>Chapter</p>
          <ul className="gap-2 flex flex-col">
            <li>
              <Skeleton className="h-4 w-full" />
            </li>
            <li>
              <Skeleton className="h-4 w-full" />
            </li>
            <li>
              <Skeleton className="h-4 w-full" />
            </li>
          </ul>
        </Card>
      </section>
    </>
  );
}
