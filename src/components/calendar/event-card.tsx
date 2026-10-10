import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// NOTE: Unwired developer template. Display one published lesson/event in the chronological agenda.
// TODO: Add event props and render valid start/end instants in explicitly labeled Asia/Tokyo time.
// See docs/developer-guide.md, Calendar.
export function EventCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Calendar event — template</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <p>Event data and timezone formatting are not connected yet.</p>
      </CardContent>
    </Card>
  );
}
