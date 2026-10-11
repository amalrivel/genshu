"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startPractice } from "@/lib/activities/actions";

export function PracticeLaunch({ activityId, resumeAttemptId }: { activityId: string; resumeAttemptId?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function launch(attemptId?: string) {
    startTransition(async () => {
      const id = attemptId ?? (await startPractice(activityId)).attemptId;
      router.push(`/activities/${activityId}?attempt=${encodeURIComponent(id)}`);
    });
  }
  return <div className="flex flex-wrap gap-2">
    {resumeAttemptId ? <Button type="button" disabled={pending} onClick={() => launch(resumeAttemptId)}>{pending ? "Opening…" : "Resume draft"}</Button> : null}
    <Button type="button" variant={resumeAttemptId ? "outline" : "default"} disabled={pending} onClick={() => launch()}>{resumeAttemptId ? "Start another attempt" : "Start practice"}</Button>
  </div>;
}
