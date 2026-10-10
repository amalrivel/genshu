import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// NOTE: Unwired developer template. Display the full published announcement; draft access stays server-authorized.
// TODO: Render validated content and readable publication details from established props.
// See docs/developer-guide.md, Announcements.
export function AnnouncementContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Announcement content — template</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <p>Full announcement content is not connected yet.</p>
      </CardContent>
    </Card>
  );
}
