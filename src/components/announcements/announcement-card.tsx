import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// NOTE: Unwired developer template. Display a published announcement preview for the list or dashboard.
// TODO: Add summary props and a detail link once /announcements/[announcementId] exists.
// See docs/developer-guide.md, Announcements.
export function AnnouncementCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Announcement — template</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <p>Announcement previews are not connected yet.</p>
      </CardContent>
    </Card>
  );
}
