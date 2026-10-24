import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TopicCard({
  topic,
}: {
  topic: { id: string; title: string; description: string };
}) {
  return (
    <Link
      href={`/learn/${encodeURIComponent(topic.id)}`}
      className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 break-words">{topic.title}</h2>
            <ChevronRight
              aria-hidden="true"
              className="mt-1 size-4 shrink-0 text-muted-foreground"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{topic.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
