import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tokyoDateTime = new Intl.DateTimeFormat("en", {
  timeZone: "Asia/Tokyo",
  dateStyle: "medium",
  timeStyle: "short",
  hourCycle: "h23",
});

export function EventCard({ event }: { event: { title: string; details: string; startsAt: string; endsAt: string } }) {
  return <Card>
    <CardHeader>
      <CardTitle>{event.title}</CardTitle>
      <p className="text-sm text-muted-foreground">
        <time dateTime={event.startsAt}>{tokyoDateTime.format(new Date(event.startsAt))}</time>
        {" – "}
        <time dateTime={event.endsAt}>{tokyoDateTime.format(new Date(event.endsAt))}</time>
        {" JST (Asia/Tokyo)"}
      </p>
    </CardHeader>
    <CardContent><p className="whitespace-pre-wrap">{event.details}</p></CardContent>
  </Card>;
}
