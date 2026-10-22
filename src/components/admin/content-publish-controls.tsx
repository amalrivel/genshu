"use client";

import { useRef, useState, useTransition } from "react";
import { publishContent } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function ContentPublishControls({ kind, id, title }: { kind: string; id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  function publish() {
    if (lock.current) return;
    lock.current = true; setError(null);
    const form = new FormData(); form.set("kind", kind); form.set("id", id);
    startTransition(async () => {
      try {
        const result = await publishContent(form);
        if (!result.success) setError(Object.values(result.fieldErrors ?? {}).join(" ") || result.message);
      } catch { setError("Belum berhasil menerbitkan. Silakan coba lagi."); }
      finally { lock.current = false; }
    });
  }
  return <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="outline" aria-label={`Terbitkan ${title}`} disabled={pending} onClick={publish}>{pending ? <><Spinner aria-hidden="true" />Menerbitkan…</> : "Terbitkan"}</Button>{error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}</div>;
}
