import { Card } from "@/components/ui/card";
import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      {/* TODO: Replace this unconditional success alert with published announcement
          previews. Current behavior is static, not a real account-update result.
          See docs/developer-guide.md, Home. */}
      <section>
        <Alert className="max-w">
          <CheckCircle2Icon />
          <AlertTitle>Account updated successfully</AlertTitle>
          <AlertDescription>
            Your profile information has been saved. Changes will be reflected
            immediately.
          </AlertDescription>
        </Alert>
      </section>

      {/* TODO: Give these shortcuts labels and links to Learn and Activities. */}
      <section className="flex justify-end gap-2">
        <Button></Button>
        <Button></Button>
      </section>

      {/* TODO: Show upcoming events and this student's saved practice results;
          use meaningful empty states. Attendance is deferred. */}
      <section>
        <Card></Card>
        <Card></Card>
      </section>
    </>
  );
}
