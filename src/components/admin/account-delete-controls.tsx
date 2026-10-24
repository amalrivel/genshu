"use client";
import { translateFeedback } from "@/i18n/feedback";
import { useTranslations } from "next-intl";

import { useRef, useState, useTransition } from "react";
import { deleteAccount } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export function AccountDeleteControls({
  id,
  name,
  email,
}: {
  id: string;
  name: string;
  email: string;
}) {
  const feedback = useTranslations("Feedback");

  const t = useTranslations("UI");

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const cancel = useRef<HTMLButtonElement>(null);

  function remove() {
    if (lock.current) return;
    lock.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("userId", id);
        const result = await deleteAccount(form);
        if (!result.success) {
          setError(
            Object.values(result.fieldErrors ?? {})
              .map((message) => translateFeedback(feedback, message))
              .join(" ") || translateFeedback(feedback, result.message),
          );
          return;
        }
        setOpen(false);
      } catch {
        setError(t("Belum_berhasil_menghapus_akun_Periksa_koneksi_dan_coba_lagi"));
      } finally {
        lock.current = false;
      }
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!lock.current) {
          setOpen(next);
          setError(null);
        }
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            aria-label={t("deleteAccount", { name })}
          />
        }
      >
        {t("Hapus")}
      </AlertDialogTrigger>
      <AlertDialogContent
        initialFocus={cancel}
        className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Hapus_akun_ini")}</AlertDialogTitle>
          <AlertDialogDescription className="min-w-0 break-words">
            {t("deleteAccountImpact", { name, email })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancel} disabled={pending}>
            {t("Batal")}
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={pending} onClick={remove}>
            {pending ? (
              <>
                <Spinner aria-hidden="true" />
                {t("Menghapus")}
              </>
            ) : (
              t("Hapus_permanen")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
