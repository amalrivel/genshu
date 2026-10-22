"use client";

import { createContext, useContext, useId, useRef, useState, cloneElement, type ReactElement, type ReactNode, type FormEvent } from "react";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import type { ActionResult } from "@/lib/admin/types";

const EditorContext = createContext<{ setDirty: (value: boolean) => void; setPending: (value: boolean) => void }>({ setDirty: () => undefined, setPending: () => undefined });
const FormContext = createContext<{ id: string; errors: Record<string, string>; markDirty: () => void }>({ id: "", errors: {}, markDirty: () => undefined });

export function RecordEditor({ title, description, children, create = false, actions, triggerLabel = "Ubah" }: { title: string; description?: string; children: ReactNode; create?: boolean; actions?: ReactNode; triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  return <Dialog open={open} disablePointerDismissal onOpenChange={(next, details) => {
    if (!next && (pending || details.reason === "escape-key")) { details.cancel(); return; }
    if (!next && dirty) { details.cancel(); setConfirm(true); return; }
    setOpen(next);
  }}>
    <div className="flex flex-wrap items-center gap-2">
      <DialogTrigger render={<Button type="button" variant={create ? "default" : "outline"} />}>{create ? title : triggerLabel}<span className="sr-only">{create ? "" : ` ${title}`}</span></DialogTrigger>
      {actions}
    </div>
    <DialogContent showCloseButton={false} initialFocus={heading} className="inset-0 flex h-dvh max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-w-none data-open:animate-none data-closed:animate-none">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-8">
          <DialogClose render={<Button type="button" variant="outline" className="self-start" disabled={pending} />}><ArrowLeft data-icon="inline-start" aria-hidden="true" />Kembali ke daftar</DialogClose>
          <DialogHeader><p className="text-sm text-muted-foreground">Editor pengelolaan</p><DialogTitle render={<h1 ref={heading} tabIndex={-1} />} className="break-words">{title}</DialogTitle><DialogDescription>{description ?? "Simpan perubahan sebagai draft, lalu terbitkan setelah ditinjau."}</DialogDescription></DialogHeader>
          <EditorContext.Provider value={{ setDirty, setPending }}>{children}</EditorContext.Provider>
        </div>
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Kembali tanpa menyimpan?</AlertDialogTitle><AlertDialogDescription>Perubahan Anda belum tersimpan. Tetap di editor untuk menyimpannya.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Kembali ke editor</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={() => { setDirty(false); setConfirm(false); setOpen(false); }}>Buang perubahan</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </DialogContent>
  </Dialog>;
}

export function ManagementForm({ action, children, submitLabel = "Simpan draft", resetOnSuccess = false, published = false }: { action: (form: FormData) => Promise<ActionResult>; children: ReactNode; submitLabel?: string; resetOnSuccess?: boolean; published?: boolean }) {
  const id = useId();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, setPending] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [version, setVersion] = useState(0);
  const summary = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const editor = useContext(EditorContext);
  useUnsavedChanges(dirty);
  const markDirty = () => { setDirty(true); editor.setDirty(true); setResult(null); };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const form = new FormData(event.currentTarget);
    lock.current = true; setPending(true); editor.setPending(true); setResult(null);
    try {
      const response = await action(form);
      setResult(response);
      if (response.success) { setDirty(false); editor.setDirty(false); if (resetOnSuccess) setVersion((value) => value + 1); }
    } catch { setResult({ success: false, message: "Belum berhasil menyimpan. Isian Anda tetap ada. Silakan coba lagi." }); }
    finally { lock.current = false; setPending(false); editor.setPending(false); requestAnimationFrame(() => summary.current?.focus()); }
  }
  return <FormContext.Provider value={{ id, errors: result?.fieldErrors ?? {}, markDirty }}>
    <form onSubmit={submit} onChange={markDirty} aria-busy={pending} className="flex flex-col gap-5">
      {published ? <Alert variant="warning" role="note"><AlertDescription>Menyimpan perubahan akan mengembalikan konten ini menjadi draft. Terbitkan kembali setelah ditinjau agar tersedia bagi siswa.</AlertDescription></Alert> : null}
      <fieldset key={version} disabled={pending} className="min-w-0">{children}</fieldset>
      {result ? <div ref={summary} tabIndex={-1}><Alert variant={result.success ? "success" : "destructive"}><AlertDescription><p>{result.message}</p>{result.fieldErrors ? <ul className="list-disc pl-5">{Object.entries(result.fieldErrors).map(([name, message]) => <li key={name}><a href={`#${id}-${name}`} onClick={(event) => { event.preventDefault(); const target = document.getElementById(`${id}-${name}`); (target?.querySelector("input, textarea, select") as HTMLElement | null ?? target)?.focus(); }}>{message}</a></li>)}</ul> : null}</AlertDescription></Alert></div> : null}
      <Button type="submit" disabled={pending || !dirty}>{pending ? <><Spinner aria-hidden="true" />Menyimpan…</> : submitLabel}</Button>
    </form>
  </FormContext.Provider>;
}

export function useManagementField(name: string) {
  const form = useContext(FormContext);
  return { id: `${form.id}-${name}`, errorId: `${form.id}-${name}-error`, error: form.errors[name], markDirty: form.markDirty };
}

export function AdminField({ name, label, hint, children }: { name: string; label: string; hint?: string; children: ReactElement<{ id?: string; name?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }> }) {
  const { id, errorId, error } = useManagementField(name);
  return <Field data-invalid={!!error}><FieldLabel htmlFor={id}>{label}</FieldLabel>{cloneElement(children, { id, name, "aria-invalid": !!error, "aria-describedby": error ? errorId : hint ? `${id}-hint` : undefined })}{hint ? <FieldDescription id={`${id}-hint`}>{hint}</FieldDescription> : null}{error ? <FieldError id={errorId}>{error}</FieldError> : null}</Field>;
}
