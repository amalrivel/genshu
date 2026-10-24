"use client";
import { translateFeedback } from "@/i18n/feedback";
import { useTranslations } from "next-intl";

import { useRef, useState, useTransition } from "react";
import { deleteContent } from "@/lib/admin/actions";
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

export function ContentDeleteControls({
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

  const deletionDetails: Record<string, { label: string; impact: string }> = {
    topic: {
      label: t("kind_topic"),
      impact: t(
        "Topik_hanya_dapat_dihapus_jika_tidak_memiliki_subjek_Hapus_atau_pindahkan_semua_subje",
      ),
    },
    subject: {
      label: t("kind_subject"),
      impact: t(
        "Subjek_hanya_dapat_dihapus_jika_tidak_memiliki_materi_atau_draft_materi_Hapus_materi_",
      ),
    },
    activity: {
      label: t("kind_activity"),
      impact: t(
        "Latihan_yang_sudah_memiliki_pengerjaan_tidak_dapat_dihapus_Jika_penghapusan_berhasil_",
      ),
    },
    announcement: {
      label: t("kind_announcement"),
      impact: t("Pengumuman_tidak_lagi_tersedia_bagi_pengguna_Genshu"),
    },
    recording: {
      label: t("kind_recording"),
      impact: t("Tautan_rekaman_di_Genshu_dihapus_Video_di_layanan_eksternal_tetap_tersimpan"),
    },
    event: { label: t("kind_event"), impact: t("Kegiatan_akan_dihapus_dari_jadwal_Genshu") },
  };

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const cancel = useRef<HTMLButtonElement>(null);
  const details = deletionDetails[kind] ?? {
    label: t("kind_content"),
    impact: t("Konten_tidak_lagi_tersedia_di_Genshu"),
  };

  function remove() {
    if (lock.current) return;
    lock.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("kind", kind);
        form.set("id", id);
        const result = await deleteContent(form);
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
        setError(t("deleteFailed", { kind: details.label }));
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
            aria-label={t("deleteNamed", { title })}
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
          <AlertDialogTitle>{t("deleteKind", { kind: details.label })}</AlertDialogTitle>
          <AlertDialogDescription className="min-w-0 break-words">
            {t("deleteImpact", { title })} {details.impact}
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
