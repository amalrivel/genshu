import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// NOTE: Unwired developer template. Render reviewed, published lesson content, not executable imported code.
// TODO: Render sanitized content with semantic furigana/ruby; keep Word conversion on the server.
// See docs/developer-guide.md, Learn.
export function MaterialContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Lesson material — template</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <p>Published lesson content is not connected yet.</p>
      </CardContent>
    </Card>
  );
}
