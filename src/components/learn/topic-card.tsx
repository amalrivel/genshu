import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// NOTE: Unwired developer template. Display a topic summary and navigate to its subjects.
// TODO: Add established topic props, readable title/description, and a /learn link.
// See docs/developer-guide.md, Learn.
export function TopicCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Topic — template</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <p>Topic data and navigation are not connected yet.</p>
      </CardContent>
    </Card>
  );
}
