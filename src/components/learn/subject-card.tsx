import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SubjectCard({ topicId, subject }: { topicId: string; subject: { id: string; title: string; description: string } }) {
  return <Link href={`/learn/${encodeURIComponent(topicId)}/${encodeURIComponent(subject.id)}`} className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2">
    <Card className="h-full transition-colors hover:bg-muted/40">
      <CardHeader><CardTitle><h2>{subject.title}</h2></CardTitle></CardHeader>
      <CardContent><p className="text-muted-foreground">{subject.description}</p></CardContent>
    </Card>
  </Link>;
}
