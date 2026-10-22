"use client";

import { useRef, useState, useTransition } from "react";
import { deleteContent } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

const deletionDetails: Record<string, { label: string; impact: string }> = {
  topic: { label: "topik", impact: "Topik hanya dapat dihapus jika tidak memiliki subjek. Hapus atau pindahkan semua subjek terlebih dahulu." },
  subject: { label: "subjek", impact: "Subjek hanya dapat dihapus jika tidak memiliki materi atau draft materi. Hapus materi dan draftnya terlebih dahulu." },
  activity: { label: "latihan", impact: "Latihan yang sudah memiliki pengerjaan tidak dapat dihapus. Jika penghapusan berhasil, seluruh soal latihan ikut dihapus." },
  announcement: { label: "pengumuman", impact: "Pengumuman tidak lagi tersedia bagi pengguna Genshu." },
  recording: { label: "rekaman", impact: "Tautan rekaman di Genshu dihapus. Video di layanan eksternal tetap tersimpan." },
  event: { label: "kegiatan", impact: "Kegiatan akan dihapus dari jadwal Genshu." },
};

export function ContentDeleteControls({ kind, id, title }: { kind: string; id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const cancel = useRef<HTMLButtonElement>(null);
  const details = deletionDetails[kind] ?? { label: "konten", impact: "Konten tidak lagi tersedia di Genshu." };

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
          setError(Object.values(result.fieldErrors ?? {}).join(" ") || result.message);
          return;
        }
        setOpen(false);
      } catch {
        setError(`Belum berhasil menghapus ${details.label}. Periksa koneksi dan coba lagi.`);
      } finally {
        lock.current = false;
      }
    });
  }

  return <AlertDialog open={open} onOpenChange={(next) => { if (!lock.current) { setOpen(next); setError(null); } }}>
    <AlertDialogTrigger render={<Button type="button" variant="outline" disabled={pending} aria-label={`Hapus ${title}`} />}>Hapus</AlertDialogTrigger>
    <AlertDialogContent initialFocus={cancel} className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto">
      <AlertDialogHeader>
        <AlertDialogTitle>Hapus {details.label} ini?</AlertDialogTitle>
        <AlertDialogDescription className="min-w-0 break-words">{title} akan dihapus permanen. {details.impact}</AlertDialogDescription>
      </AlertDialogHeader>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <AlertDialogFooter>
        <AlertDialogCancel ref={cancel} disabled={pending}>Batal</AlertDialogCancel>
        <AlertDialogAction variant="destructive" disabled={pending} onClick={remove}>{pending ? <><Spinner aria-hidden="true" />Menghapus…</> : "Hapus permanen"}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
