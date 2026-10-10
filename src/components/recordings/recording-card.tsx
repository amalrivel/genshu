import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// NOTE: Unwired developer template. Display a published class recording summary and external provider link.
// TODO: Add title, description, lesson date, and a validated link; provider controls video access.
// See docs/developer-guide.md, Class recordings.
export function RecordingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Class recording — template</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <p>Recording data and provider links are not connected yet.</p>
      </CardContent>
    </Card>
  );
}
