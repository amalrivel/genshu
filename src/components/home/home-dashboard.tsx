import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// NOTE: Unwired developer template. Compose published announcements, upcoming events, and the student’s recent practice results.
// TODO: Use real summaries and meaningful empty states; practice-only v1, attendance deferred.
// See docs/developer-guide.md, Home.
export function HomeDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Dashboard — template</h2></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <section>
          <h3>Announcements</h3>
          <p>Published announcement previews are not connected yet.</p>
        </section>
        <section>
          <h3>Upcoming events</h3>
          <p>Published event summaries are not connected yet.</p>
        </section>
        <section>
          <h3>Recent practice</h3>
          <p>Your saved practice results are not connected yet.</p>
        </section>
      </CardContent>
    </Card>
  );
}
