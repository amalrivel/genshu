import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// NOTE: Unwired developer template. Template only: no publishing controls or mutation are active.
// TODO: Add management-authorized draft review/publication; validate content and preserve saved attempts.
// See docs/developer-guide.md, Management.
export function ContentPublishControls() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Content publication — template</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <p>Draft review and publication are not connected yet.</p>
      </CardContent>
    </Card>
  );
}
