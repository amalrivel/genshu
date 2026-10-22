import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function RecordingCard({ recording }: { recording: { title: string; description: string; lessonDate: string; url: string } }) {
  const date = new Date(recording.lessonDate);
  return <Card>
    <CardHeader>
      <CardTitle><h2 className="break-words">{recording.title}</h2></CardTitle>
      <time dateTime={recording.lessonDate} className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Tokyo" }).format(date)}</time>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      <p className="break-words">{recording.description}</p>
      <div className="flex flex-col gap-2">
        <a href={recording.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", size: "lg", className: "min-h-11 whitespace-normal" })}>Tonton rekaman</a>
        <p className="text-sm text-muted-foreground">Terbuka di tab baru. Akses pemutaran mengikuti ketentuan penyedia video.</p>
      </div>
    </CardContent>
  </Card>;
}
