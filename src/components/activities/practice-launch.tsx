"use client";
import { useTranslations } from "next-intl";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { startPractice } from "@/lib/activities/actions";

export function PracticeLaunch({
  activityId,
  resumeAttemptId,
}: {
  activityId: string;
  resumeAttemptId?: string;
}) {
  const t = useTranslations("UI");

  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function launch(attemptId?: string) {
    setError(null);
    startTransition(async () => {
      try {
        const id = attemptId ?? (await startPractice(activityId)).attemptId;
        router.push(`/activities/${activityId}?attempt=${encodeURIComponent(id)}`);
      } catch {
        setError(t("Latihan_belum_dapat_dibuka_Silakan_coba_lagi"));
      }
    });
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {resumeAttemptId ? (
          <Button type="button" disabled={pending} onClick={() => launch(resumeAttemptId)}>
            {pending ? (
              <>
                <Spinner aria-hidden="true" />
                {t("Membuka")}
              </>
            ) : (
              t("Lanjutkan_latihan")
            )}
          </Button>
        ) : null}
        <Button
          type="button"
          variant={resumeAttemptId ? "outline" : "default"}
          disabled={pending}
          onClick={() => launch()}
        >
          {pending ? (
            <>
              <Spinner aria-hidden="true" />
              {t("Membuka")}
            </>
          ) : resumeAttemptId ? (
            t("Mulai_latihan_baru")
          ) : (
            t("Mulai_latihan")
          )}
        </Button>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
