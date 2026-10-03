import { Card } from "@/components/ui/card";
import { CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      {/* NOTE: this section for news information or 
        something important 
        sensei or tantosha want
        to say to gakusei or user.
        And also notification from system or developer, 
        what must user to do. 
      */}
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

      {/* NOTE: Fast button to specific route,
      this routes must be often visit by user*/}
      <section className="flex justify-end gap-2">
        <Button></Button>
        <Button></Button>
      </section>

      {/* NOTE: basic information about attendance or homework
        or 
        something else about study or important think.
           */}
      <section>
        <Card></Card>
        <Card></Card>
      </section>
    </>
  );
}
