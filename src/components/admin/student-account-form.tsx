import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// NOTE: Unwired developer template. Template only: no account form or account mutation is active.
// TODO: Add administrator-only provisioning and credential handling; never expose public signup.
// See docs/developer-guide.md, Management.
export function StudentAccountForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Student account management — template</h2></CardTitle>
      </CardHeader>
      <CardContent>
        <p>Account management is not connected yet.</p>
      </CardContent>
    </Card>
  );
}
