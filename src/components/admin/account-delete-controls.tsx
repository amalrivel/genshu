"use client";

import { useRef, useState, useTransition } from "react";
import { deleteAccount } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

export function AccountDeleteControls({ id, name, email }: { id: string; name: string; email: string }) {
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
          setError(Object.values(result.fieldErrors ?? {}).join(" ") || result.message);
          return;
        }
        setOpen(false);
      } catch {
        setError("Belum berhasil menghapus akun. Periksa koneksi dan coba lagi.");
      } finally {
        lock.current = false;
      }
    });
  }

  return <AlertDialog open={open} onOpenChange={(next) => { if (!lock.current) { setOpen(next); setError(null); } }}>
    <AlertDialogTrigger render={<Button type="button" variant="outline" disabled={pending} aria-label={`Hapus akun ${name}`} />}>Hapus</AlertDialogTrigger>
    <AlertDialogContent initialFocus={cancel} className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto">
      <AlertDialogHeader>
        <AlertDialogTitle>Hapus akun ini?</AlertDialogTitle>
        <AlertDialogDescription className="min-w-0 break-words">Akun {name} ({email}) akan dihapus permanen beserta data masuk dan semua sesinya. Pengguna tidak lagi dapat masuk dengan akun ini. Akun yang memiliki pengerjaan atau hasil latihan tidak dapat dihapus.</AlertDialogDescription>
      </AlertDialogHeader>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <AlertDialogFooter>
        <AlertDialogCancel ref={cancel} disabled={pending}>Batal</AlertDialogCancel>
        <AlertDialogAction variant="destructive" disabled={pending} onClick={remove}>{pending ? <><Spinner aria-hidden="true" />Menghapus…</> : "Hapus permanen"}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
