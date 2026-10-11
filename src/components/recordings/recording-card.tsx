import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecordingCard({ recording }: { recording: { title: string; description: string; lessonDate: string; url: string } }) {
  const date = new Date(recording.lessonDate);
  return <Card>
    <CardHeader>
      <CardTitle>{recording.title}</CardTitle>
      <time dateTime={recording.lessonDate} className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "Asia/Tokyo" }).format(date)}</time>
    </CardHeader>
    <CardContent className="space-y-3">
      <p>{recording.description}</p>
      <a href={recording.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Open recording (external site)</a>
    </CardContent>
  </Card>;
}
