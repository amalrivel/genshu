"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { importMaterial, previewMaterialDraft, publishMaterialDraft, saveMaterialDraft, deleteMaterial } from "@/lib/admin/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { AdminField, ManagementForm, RecordEditor } from "./management-form";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import type { ManagementContent, MaterialStatus, MaterialDestination } from "@/lib/admin/types";

type Preview = Awaited<ReturnType<typeof previewMaterialDraft>>;
const materialHref = (material: MaterialDestination) => `/learn/${encodeURIComponent(material.topicId)}/${encodeURIComponent(material.subjectId)}`;
type MaterialSource = { kind: MaterialStatus; id: string; title: string; description: string; subject: ManagementContent["materials"][number]["subject"] };

function DeleteMaterial({ source, onDeleted }: { source: MaterialSource; onDeleted: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  function remove() {
    if (lock.current) return;
    lock.current = true; setError(null);
    startTransition(async () => {
      try {
        const form = new FormData(); form.set("id", source.id); form.set("kind", source.kind);
        const result = await deleteMaterial(form);
        if (!result.success) { setError(result.message); return; }
        setOpen(false); onDeleted(result.message);
      } catch { setError("Belum berhasil menghapus materi. Periksa koneksi dan coba lagi."); }
      finally { lock.current = false; }
    });
  }
  return <AlertDialog open={open} onOpenChange={(next) => { if (!pending) { setOpen(next); setError(null); } }}>
    <AlertDialogTrigger render={<Button type="button" variant="outline" aria-label={`Hapus ${source.title}`} />}>Hapus</AlertDialogTrigger>
    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Hapus {source.kind === "draft" ? "draft" : "materi"} ini?</AlertDialogTitle><AlertDialogDescription>{source.title} akan dihapus permanen. {source.kind === "draft" ? "Materi yang sudah terbit tetap tersedia." : "Materi tidak lagi tersedia di Belajar. Topik, subjek, dan draft revisi tetap tersimpan."}</AlertDialogDescription></AlertDialogHeader>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <AlertDialogFooter><AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={pending} onClick={remove}>{pending ? <><Spinner aria-hidden="true" />Menghapus…</> : "Hapus permanen"}</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}

function ReviewDraft({ draft, onPublished }: { draft: Preview; onPublished: (material: MaterialDestination) => void }) {
  const [pending, startTransition] = useTransition();
  const [reviewed, setReviewed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState<MaterialDestination | null>(null);
  const ready = draft.subjectPublished && draft.topicPublished;
  function publish() {
    if (pending || !reviewed || !ready) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await publishMaterialDraft(draft.draftId);
        if (!result.success || !("material" in result)) { setError(Object.values(result.fieldErrors ?? {}).join(" ") || result.message); return; }
        setPublished(result.material); onPublished(result.material);
      } catch { setError("Materi belum berhasil diterbitkan. Draft Anda tetap tersimpan. Coba lagi."); }
    });
  }
  return <Card>
    <CardHeader><CardTitle><h4>{draft.title}</h4></CardTitle><CardDescription>Lokasi: Belajar → {draft.topicTitle} → {draft.subjectTitle}</CardDescription></CardHeader>
    <CardContent className="flex flex-col gap-5"><p>{draft.description}</p>
      {published ? <Alert variant="success"><AlertDescription>Materi berhasil diterbitkan. <Link href={materialHref(published)}>Lihat materi di Belajar</Link>.</AlertDescription></Alert> : <>
        {!ready ? <Alert variant="warning" role="note"><AlertTitle>Lokasi materi belum tersedia untuk siswa</AlertTitle><AlertDescription><p>Materi ini berada di topik {draft.topicTitle} dan subjek {draft.subjectTitle}. Terbitkan bagian yang masih draft sebelum menerbitkan materi.</p><div className="flex flex-wrap gap-3">{!draft.topicPublished ? <Link className="inline-flex min-h-11 items-center" href={`/admin?${new URLSearchParams({ section: "topics", q: draft.topicTitle })}`}>Kelola topik {draft.topicTitle}</Link> : null}{!draft.subjectPublished ? <Link className="inline-flex min-h-11 items-center" href={`/admin?${new URLSearchParams({ section: "subjects", q: draft.subjectTitle })}`}>Kelola subjek {draft.subjectTitle}</Link> : null}</div></AlertDescription></Alert> : null}
        {draft.replacesPublished ? <Alert variant="warning" role="note"><AlertDescription>Publikasi draft ini akan mengganti materi yang saat ini tersedia pada subjek {draft.subjectTitle}. Versi terbit tetap tersedia sampai draft ini diterbitkan.</AlertDescription></Alert> : null}
        {draft.warnings.length ? <Alert variant="warning" role="note"><AlertTitle>Periksa hasil impor</AlertTitle><AlertDescription><ul className="list-disc pl-5">{draft.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></AlertDescription></Alert> : null}
      </>}
      <div className="reading-content rounded-lg border bg-background p-4 sm:p-6" role="region" aria-label="Pratinjau isi materi" tabIndex={0} dangerouslySetInnerHTML={{ __html: draft.html }} />
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      {!published ? <><Field orientation="horizontal"><Checkbox id={`review-${draft.draftId}`} checked={reviewed} disabled={pending || !ready} onCheckedChange={(value) => setReviewed(value === true)} /><FieldLabel htmlFor={`review-${draft.draftId}`}>Saya sudah memeriksa pratinjau dan seluruh peringatannya.</FieldLabel></Field><div><Button onClick={publish} disabled={pending || !reviewed || !ready}>{pending ? <><Spinner aria-hidden="true" />Menerbitkan…</> : "Terbitkan materi yang ditinjau"}</Button></div></> : null}
    </CardContent>
  </Card>;
}

function DraftReview({ draft, onPublished, onDeleted, subjects }: { draft: ManagementContent["materialDrafts"][number]; onPublished: (material: MaterialDestination) => void; onDeleted: (message: string) => void; subjects: ManagementContent["subjectOptions"] }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  function load() {
    setError(false);
    startTransition(async () => {
      try { setPreview(await previewMaterialDraft(draft.id)); }
      catch { setError(true); }
    });
  }
  return <li className="flex flex-col gap-4 rounded-xl border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h3 className="break-words font-semibold">{draft.title}</h3><p className="text-sm text-muted-foreground">{draft.subject?.topic?.title} → {draft.subject?.title}</p></div><Badge variant="warning">Draft</Badge></div><p className="break-words text-sm text-muted-foreground">{draft.description}</p>
    <div className="flex flex-wrap items-center gap-2">{preview ? <Button variant="outline" onClick={() => setPreview(null)}>Tutup pratinjau</Button> : <Button variant="outline" disabled={pending} onClick={load}>{pending ? <><Spinner aria-hidden="true" />Memuat pratinjau…</> : "Tinjau draft"}</Button>}
      <RecordEditor title={draft.title} description="Ubah judul, deskripsi, atau unggah dokumen pengganti. Tinjau perubahan sebelum diterbitkan." actions={<DeleteMaterial source={{ ...draft, kind: "draft" }} onDeleted={onDeleted} />}><MaterialEditor source={{ ...draft, kind: "draft" }} subjects={subjects} onPublished={onPublished} onSaved={() => setPreview(null)} /></RecordEditor>
    </div>
    {preview ? <ReviewDraft draft={preview} onPublished={onPublished} /> : null}
    {error ? <Alert variant="destructive"><AlertDescription>Pratinjau belum dapat dimuat. Silakan coba lagi.</AlertDescription></Alert> : null}
  </li>;
}

function MaterialEditor({ subjects, source: record, onPublished, onSaved }: { subjects: ManagementContent["subjectOptions"]; source?: MaterialSource; onPublished: (material: MaterialDestination) => void; onSaved?: () => void }) {
  // Keep uncontrolled field defaults stable while a save refreshes the list.
  const [source] = useState(record);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [draftId, setDraftId] = useState(source?.kind === "draft" ? source.id : null);
  const [completed, setCompleted] = useState(false);
  return <div className="flex flex-col gap-6">
    {source?.kind === "published" && !completed ? <Alert variant="warning" role="note"><AlertDescription>Perubahan disimpan sebagai draft revisi. Materi terbit tetap tersedia sampai Anda meninjau dan menerbitkan revisi.</AlertDescription></Alert> : null}
    {!completed ? <div onChangeCapture={() => setPreview(null)}><ManagementForm resetOnSuccess={!source} submitLabel={source ? "Simpan perubahan sebagai draft" : "Impor sebagai draft"} action={async (form) => {
      const upload = form.get("file");
      // Empty file inputs can gain a filename during Server Action serialization.
      if (source && upload instanceof File && !upload.name && !upload.size) form.delete("file");
      if (source) { form.set("id", draftId ?? source.id); form.set("kind", draftId ? "draft" : source.kind); }
      const result = source ? await saveMaterialDraft(form) : await importMaterial(form);
      if (result.success && "preview" in result) { setPreview(result.preview); setDraftId(result.preview.draftId); onSaved?.(); }
      return result;
    }}><FieldGroup>
      {source ? <p className="text-sm text-muted-foreground">Lokasi: Belajar → {source.subject?.topic?.title} → {source.subject?.title}</p> : <AdminField name="subjectId" label="Subjek" hint="Materi akan ditempatkan di topik dan subjek yang Anda pilih."><NativeSelect required defaultValue=""><option value="" disabled>Pilih subjek</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.topic?.title ?? "Topik"} / {subject.title}{!subject.published || !subject.topic?.published ? " (belum terbit)" : ""}</option>)}</NativeSelect></AdminField>}
      <AdminField name="title" label="Judul materi"><Input required maxLength={160} defaultValue={source?.title} /></AdminField>
      <AdminField name="description" label="Deskripsi"><Textarea required maxLength={500} defaultValue={source?.description} /></AdminField>
      <AdminField name="file" label={source ? "Ganti isi dari Word (opsional)" : "Dokumen Word (.docx)"} hint={source ? "Biarkan kosong untuk mempertahankan isi, gambar, tabel, dan furigana. DOCX pengganti maksimal 10 MiB; hasilnya perlu ditinjau kembali." : "Ukuran maksimal 10 MiB. Materi terbit tetap tersedia jika impor gagal."}><Input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required={!source} /></AdminField>
    </FieldGroup></ManagementForm></div> : null}
    {preview ? <><p className="text-sm text-muted-foreground">Draft sudah tersimpan. Anda dapat meninjaunya sekarang atau membukanya kembali dari <Link className="underline" href="/admin?section=materials&status=draft">daftar Draft</Link>.</p><ReviewDraft key={preview.draftId} draft={preview} onPublished={(material) => { setCompleted(true); onPublished(material); }} /></> : null}
  </div>;
}

export function MaterialImportForm({ subjects, drafts, materials, status }: { subjects: ManagementContent["subjectOptions"]; drafts: ManagementContent["materialDrafts"]; materials: ManagementContent["materials"]; status: MaterialStatus }) {
  const [published, setPublished] = useState<MaterialDestination | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  return <section className="page-stack">
    {notice ? <Alert variant="success"><AlertDescription>{notice}</AlertDescription></Alert> : null}
    {published ? <Alert variant="success"><AlertDescription><p>{published.title} berhasil diterbitkan. Materi sekarang berada di daftar Materi terbit dan halaman Belajar.</p><div className="flex flex-wrap gap-3"><Link className="inline-flex min-h-11 items-center" href={materialHref(published)}>Lihat materi di Belajar</Link><Link className="inline-flex min-h-11 items-center" href="/admin?section=materials&status=published">Buka daftar Materi terbit</Link></div></AlertDescription></Alert> : null}
    <RecordEditor title="Tambah materi" description="Impor Word (DOCX) maksimal 10 MiB. Materi disimpan sebagai draft sampai ditinjau dan diterbitkan." create><MaterialEditor subjects={subjects} onPublished={setPublished} /></RecordEditor>
    {status === "draft" ? <>
      <h2>Draft menunggu tinjauan</h2>
      {drafts.length ? <ul className="flex flex-col gap-4">{drafts.map((draft) => <DraftReview key={draft.id} draft={draft} subjects={subjects} onPublished={setPublished} onDeleted={setNotice} />)}</ul> : <CollectionEmpty title="Tidak ada draft materi" description="Materi yang sudah diterbitkan tersedia pada pilihan Materi terbit. Impor dokumen baru untuk membuat draft." />}
    </> : <>
      <div className="flex flex-col gap-2"><h2>Materi terbit</h2><p className="text-sm text-muted-foreground">Gunakan Ubah untuk memperbarui judul, deskripsi, atau isi dari Word. Revisi perlu ditinjau sebelum diterbitkan.</p></div>
      {materials.length ? <ul className="flex flex-col gap-4">{materials.map((material) => {
        const subject = material.subject;
        const visible = !!subject?.published && !!subject.topic?.published;
        return <li key={material.id} className="flex flex-col gap-4 rounded-xl border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-semibold">{material.title}</h3><p className="text-sm text-muted-foreground">Belajar → {subject?.topic?.title} → {subject?.title}</p></div><Badge variant={visible ? "success" : "warning"}>{visible ? "Terbit" : "Terbit · lokasi masih draft"}</Badge></div><p className="break-words text-sm text-muted-foreground">{material.description}</p>
          {visible && subject?.topic ? <div><Link href={materialHref({ title: material.title, topicId: subject.topic.id, subjectId: subject.id })} className={buttonVariants({ variant: "outline" })}>Lihat materi di Belajar</Link></div> : <Alert variant="warning" role="note"><AlertDescription><p>Materi tersimpan, tetapi belum tampil untuk siswa karena topik atau subjeknya masih draft.</p><div className="flex flex-wrap gap-3">{subject?.topic && !subject.topic.published ? <Link className="inline-flex min-h-11 items-center" href={`/admin?${new URLSearchParams({ section: "topics", q: subject.topic.title })}`}>Kelola topik {subject.topic.title}</Link> : null}{subject && !subject.published ? <Link className="inline-flex min-h-11 items-center" href={`/admin?${new URLSearchParams({ section: "subjects", q: subject.title })}`}>Kelola subjek {subject.title}</Link> : null}</div></AlertDescription></Alert>}
          <RecordEditor title={material.title} description="Ubah judul, deskripsi, atau unggah Word pengganti. Simpan dan tinjau draft revisi sebelum publikasi." actions={<DeleteMaterial source={{ ...material, kind: "published" }} onDeleted={setNotice} />}><MaterialEditor source={{ ...material, kind: "published" }} subjects={subjects} onPublished={setPublished} /></RecordEditor>
        </li>;
      })}</ul> : <CollectionEmpty title="Belum ada materi terbit yang cocok" description="Periksa pilihan Draft untuk materi yang baru diimpor, atau ubah kata pencarian." />}
    </>}
  </section>;
}
