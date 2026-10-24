"use client";
import { translateFeedback } from "@/i18n/feedback";
import { useTranslations } from "next-intl";

import { useRef, useState, useTransition } from "react";
import { publishContent } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function ContentPublishControls({
  kind,
  id,
  title,
}: {
  kind: string;
  id: string;
  title: string;
}) {
  const feedback = useTranslations("Feedback");

  const t = useTranslations("UI");

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  function publish() {
    if (lock.current) return;
    lock.current = true;
    setError(null);
    const form = new FormData();
    form.set("kind", kind);
    form.set("id", id);
    startTransition(async () => {
      try {
        const result = await publishContent(form);
        if (!result.success)
          setError(
            Object.values(result.fieldErrors ?? {})
              .map((message) => translateFeedback(feedback, message))
              .join(" ") || translateFeedback(feedback, result.message),
          );
      } catch {
        setError(t("Belum_berhasil_menerbitkan_Silakan_coba_lagi"));
      } finally {
        lock.current = false;
      }
    });
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        aria-label={t("publishNamed", { title })}
        disabled={pending}
        onClick={publish}
      >
        {pending ? (
          <>
            <Spinner aria-hidden="true" />
            {t("Menerbitkan")}
          </>
        ) : (
          t("Terbitkan")
        )}
      </Button>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
