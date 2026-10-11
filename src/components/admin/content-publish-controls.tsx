"use client";

import { useState, useTransition } from "react";
import { publishContent } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";

export function ContentPublishControls({ kind, id, title }: { kind: string; id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  function publish() {
    setError(false);
    const form = new FormData();
    form.set("kind", kind);
    form.set("id", id);
    startTransition(async () => {
      try { await publishContent(form); }
      catch { setError(true); }
    });
  }
  return <span className="inline-flex items-center gap-2">
    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={publish}>{pending ? "Publishing…" : `Publish ${title}`}</Button>
    {error ? <span role="alert">Could not publish. Check the item and try again.</span> : null}
  </span>;
}
