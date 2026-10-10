import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// NOTE: Unwired developer template. Display a subject summary within its topic.
// TODO: Add established subject props and a /learn/topic/subject link; no /learns URLs.
// See docs/developer-guide.md, Learn.
export function SubjectCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Subject — template</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <p>Subject data and navigation are not connected yet.</p>
      </CardContent>
    </Card>
  );
}
