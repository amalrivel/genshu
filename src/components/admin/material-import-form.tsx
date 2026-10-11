"use client";

import { useState, useTransition } from "react";
import { importMaterial, publishMaterialDraft } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Draft = { id: string; title: string; description: string; contentHtml: string; warnings: unknown; subject: { title: string } | null };
type Preview = { draftId: string; title: string; description: string; html: string; warnings: string[] };

function ReviewDraft({ draft, subjectTitle }: { draft: Preview; subjectTitle?: string }) {
  const [pending, startTransition] = useTransition();
  const [reviewed, setReviewed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function publish() {
    setError(null);
    startTransition(async () => {
      try { await publishMaterialDraft(draft.draftId); }
      catch { setError("Could not publish this draft. Check that its topic and subject are published, then try again."); }
    });
  }
  return <Card>
    <CardHeader><CardTitle>{draft.title}</CardTitle><p className="text-sm text-muted-foreground">{subjectTitle ?? "Preview before publication"}</p></CardHeader>
    <CardContent className="space-y-4">
      <p>{draft.description}</p>
      {draft.warnings.length ? <div role="status" className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3"><h3 className="font-medium">Review these import warnings</h3><ul className="list-disc pl-5">{draft.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></div> : null}
      <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: draft.html }} />
      {error ? <p role="alert">{error}</p> : null}
      <label className="flex items-start gap-2"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} /><span>I reviewed this preview and its warnings.</span></label>
      <Button type="button" onClick={publish} disabled={pending || !reviewed}>{pending ? "Publishing…" : "Publish reviewed material"}</Button>
    </CardContent>
  </Card>;
}

export function MaterialImportForm({ subjects, drafts }: {
  subjects: { id: string; title: string; topic: { title: string } | null }[];
  drafts: Draft[];
}) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await importMaterial(formData);
        setPreview(result);
      } catch {
        setError("Import failed. The existing published lesson was left unchanged. Check the file and try again.");
      }
    });
  }
  return <section className="space-y-4">
    <Card>
      <CardHeader><CardTitle>Import a Word lesson</CardTitle><p className="text-sm text-muted-foreground">DOCX only, up to 10 MiB. Imported files are drafts until reviewed and published.</p></CardHeader>
      <CardContent>
        <form action={submit}>
          <FieldGroup>
            <Field><FieldLabel htmlFor="material-subject">Subject</FieldLabel><select id="material-subject" name="subjectId" required className="h-9 rounded-md border bg-background px-3"><option value="">Choose a subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.topic?.title ?? "Topic"} / {subject.title}</option>)}</select></Field>
            <Field><FieldLabel htmlFor="material-title">Material title</FieldLabel><Input id="material-title" name="title" required maxLength={160} /></Field>
            <Field><FieldLabel htmlFor="material-description">Description</FieldLabel><Input id="material-description" name="description" required maxLength={500} /></Field>
            <Field><FieldLabel htmlFor="material-file">Word document (.docx)</FieldLabel><Input id="material-file" name="file" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /></Field>
            {error ? <p role="alert">{error}</p> : null}
            <Button type="submit" disabled={pending}>{pending ? "Importing and previewing…" : "Import to draft"}</Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
    {preview ? <ReviewDraft draft={preview} /> : null}
    {drafts.map((draft) => <ReviewDraft key={draft.id} draft={{ draftId: draft.id, title: draft.title, description: draft.description, html: draft.contentHtml, warnings: Array.isArray(draft.warnings) ? draft.warnings.map(String) : [] }} subjectTitle={draft.subject?.title} />)}
  </section>;
}
