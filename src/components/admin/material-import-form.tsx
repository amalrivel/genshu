"use client";
import { translateFeedback } from "@/i18n/feedback";
import { useTranslations } from "next-intl";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import {
  importMaterial,
  previewMaterialDraft,
  publishMaterialDraft,
  saveMaterialDraft,
  deleteMaterial,
} from "@/lib/admin/actions";
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
import type { ManagementContent, MaterialStatus, MaterialDestination } from "@/lib/admin/types";

type Preview = Awaited<ReturnType<typeof previewMaterialDraft>>;
const materialHref = (material: MaterialDestination) =>
  `/learn/${encodeURIComponent(material.topicId)}/${encodeURIComponent(material.subjectId)}`;
type MaterialSource = {
  kind: MaterialStatus;
  id: string;
  title: string;
  description: string;
  subject: ManagementContent["materials"][number]["subject"];
};

function DeleteMaterial({
  source,
  onDeleted,
}: {
  source: MaterialSource;
  onDeleted: (message: string) => void;
}) {
  const feedback = useTranslations("Feedback");

  const t = useTranslations("UI");

  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  function remove() {
    if (lock.current) return;
    lock.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("id", source.id);
        form.set("kind", source.kind);
        const result = await deleteMaterial(form);
        if (!result.success) {
          setError(translateFeedback(feedback, result.message));
          return;
        }
        setOpen(false);
        onDeleted(translateFeedback(feedback, result.message));
      } catch {
        setError(t("Belum_berhasil_menghapus_materi_Periksa_koneksi_dan_coba_lagi"));
      } finally {
        lock.current = false;
      }
    });
  }
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
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
            aria-label={t("deleteNamed", { title: source.title })}
          />
        }
      >
        {t("Hapus")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("deleteKind", {kind: source.kind === "draft" ? t("draftKind") : t("materialKind")})}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteImpact", {title: source.title})}{" "}
            {source.kind === "draft"
              ? t("Materi_yang_sudah_terbit_tetap_tersedia")
              : t(
                  "Materi_tidak_lagi_tersedia_di_Belajar_Topik_subjek_dan_draft_revisi_tetap_tersimpan",
                )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{t("Batal")}</AlertDialogCancel>
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

function ReviewDraft({
  draft,
  onPublished,
}: {
  draft: Preview;
  onPublished: (material: MaterialDestination) => void;
}) {
  const feedback = useTranslations("Feedback");

  const t = useTranslations("UI");

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
        if (!result.success || !("material" in result)) {
          setError(
            Object.values(result.fieldErrors ?? {})
              .map((message) => translateFeedback(feedback, message))
              .join(" ") || translateFeedback(feedback, result.message),
          );
          return;
        }
        setPublished(result.material);
        onPublished(result.material);
      } catch {
        setError(t("Materi_belum_berhasil_diterbitkan_Draft_Anda_tetap_tersimpan_Coba_lagi"));
      }
    });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h4>{draft.title}</h4>
        </CardTitle>
        <CardDescription>
          {t("materialLocation", {topic: draft.topicTitle, subject: draft.subjectTitle})}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p>{draft.description}</p>
        {published ? (
          <Alert variant="success">
            <AlertDescription>
              {t("Materi_berhasil_diterbitkan")}{" "}
              <Link href={materialHref(published)}>{t("Lihat_materi_di_Belajar")}</Link>.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {!ready ? (
              <Alert variant="warning" role="note">
                <AlertTitle>{t("Lokasi_materi_belum_tersedia_untuk_siswa")}</AlertTitle>
                <AlertDescription>
                  <p>
                    {t("unpublishedLocation", {topic: draft.topicTitle, subject: draft.subjectTitle})}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {!draft.topicPublished ? (
                      <Link
                        className="inline-flex min-h-11 items-center"
                        href={`/admin?${new URLSearchParams({ section: "topics", q: draft.topicTitle })}`}
                      >
                        {t("manageTopic", {title: draft.topicTitle})}
                      </Link>
                    ) : null}
                    {!draft.subjectPublished ? (
                      <Link
                        className="inline-flex min-h-11 items-center"
                        href={`/admin?${new URLSearchParams({ section: "subjects", q: draft.subjectTitle })}`}
                      >
                        {t("manageSubject", {title: draft.subjectTitle})}
                      </Link>
                    ) : null}
                  </div>
                </AlertDescription>
              </Alert>
            ) : null}
            {draft.replacesPublished ? (
              <Alert variant="warning" role="note">
                <AlertDescription>
                  {t("replaceMaterial", {subject: draft.subjectTitle})}
                </AlertDescription>
              </Alert>
            ) : null}
            {draft.warnings.length ? (
              <Alert variant="warning" role="note">
                <AlertTitle>{t("Periksa_hasil_impor")}</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5">
                    {draft.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}
          </>
        )}
        <div
          className="reading-content rounded-lg border bg-background p-4 sm:p-6"
          role="region"
          aria-label={t("Pratinjau_isi_materi")}
          tabIndex={0}
          dangerouslySetInnerHTML={{ __html: draft.html }}
        />
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {!published ? (
          <>
            <Field orientation="horizontal">
              <Checkbox
                id={`review-${draft.draftId}`}
                checked={reviewed}
                disabled={pending || !ready}
                onCheckedChange={(value) => setReviewed(value === true)}
              />
              <FieldLabel htmlFor={`review-${draft.draftId}`}>
                {t("Saya_sudah_memeriksa_pratinjau_dan_seluruh_peringatannya")}
              </FieldLabel>
            </Field>
            <div>
              <Button onClick={publish} disabled={pending || !reviewed || !ready}>
                {pending ? (
                  <>
                    <Spinner aria-hidden="true" />
                    {t("Menerbitkan")}
                  </>
                ) : (
                  t("Terbitkan_materi_yang_ditinjau")
                )}
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function DraftReview({
  draft,
  onPublished,
  onDeleted,
  subjects,
}: {
  draft: ManagementContent["materialDrafts"][number];
  onPublished: (material: MaterialDestination) => void;
  onDeleted: (message: string) => void;
  subjects: ManagementContent["subjectOptions"];
}) {
  const t = useTranslations("UI");

  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  function load() {
    setError(false);
    startTransition(async () => {
      try {
        setPreview(await previewMaterialDraft(draft.id));
      } catch {
        setError(true);
      }
    });
  }
  return (
    <li className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="break-words font-semibold">{draft.title}</h3>
          <p className="text-sm text-muted-foreground">
            {draft.subject?.topic?.title} → {draft.subject?.title}
          </p>
        </div>
        <Badge variant="warning">{t("Draft")}</Badge>
      </div>
      <p className="break-words text-sm text-muted-foreground">{draft.description}</p>
      <div className="flex flex-wrap items-center gap-2">
        {preview ? (
          <Button variant="outline" onClick={() => setPreview(null)}>
            {t("Tutup_pratinjau")}
          </Button>
        ) : (
          <Button variant="outline" disabled={pending} onClick={load}>
            {pending ? (
              <>
                <Spinner aria-hidden="true" />
                {t("Memuat_pratinjau")}
              </>
            ) : (
              t("Tinjau_draft")
            )}
          </Button>
        )}
        <RecordEditor
          title={draft.title}
          description={t(
            "Ubah_judul_deskripsi_atau_unggah_dokumen_pengganti_Tinjau_perubahan_sebelum_diterbitk",
          )}
          actions={<DeleteMaterial source={{ ...draft, kind: "draft" }} onDeleted={onDeleted} />}
        >
          <MaterialEditor
            source={{ ...draft, kind: "draft" }}
            subjects={subjects}
            onPublished={onPublished}
            onSaved={() => setPreview(null)}
          />
        </RecordEditor>
      </div>
      {preview ? <ReviewDraft draft={preview} onPublished={onPublished} /> : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{t("Pratinjau_belum_dapat_dimuat_Silakan_coba_lagi")}</AlertDescription>
        </Alert>
      ) : null}
    </li>
  );
}

function MaterialEditor({
  subjects,
  source: record,
  onPublished,
  onSaved,
}: {
  subjects: ManagementContent["subjectOptions"];
  source?: MaterialSource;
  onPublished: (material: MaterialDestination) => void;
  onSaved?: () => void;
}) {
  const t = useTranslations("UI");

  // Keep uncontrolled field defaults stable while a save refreshes the list.
  const [source] = useState(record);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [draftId, setDraftId] = useState(source?.kind === "draft" ? source.id : null);
  const [completed, setCompleted] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      {source?.kind === "published" && !completed ? (
        <Alert variant="warning" role="note">
          <AlertDescription>
            {t(
              "Perubahan_disimpan_sebagai_draft_revisi_Materi_terbit_tetap_tersedia_sampai_Anda_meni",
            )}
          </AlertDescription>
        </Alert>
      ) : null}
      {!completed ? (
        <div onChangeCapture={() => setPreview(null)}>
          <ManagementForm
            resetOnSuccess={!source}
            submitLabel={source ? t("Simpan_perubahan_sebagai_draft") : t("Impor_sebagai_draft")}
            action={async (form) => {
              const upload = form.get("file");
              // Empty file inputs can gain a filename during Server Action serialization.
              if (source && upload instanceof File && !upload.name && !upload.size)
                form.delete("file");
              if (source) {
                form.set("id", draftId ?? source.id);
                form.set("kind", draftId ? "draft" : source.kind);
              }
              const result = source ? await saveMaterialDraft(form) : await importMaterial(form);
              if (result.success && "preview" in result) {
                setPreview(result.preview);
                setDraftId(result.preview.draftId);
                onSaved?.();
              }
              return result;
            }}
          >
            <FieldGroup>
              {source ? (
                <p className="text-sm text-muted-foreground">
                  {t("materialLocation", {topic: source.subject?.topic?.title ?? "", subject: source.subject?.title ?? ""})}
                </p>
              ) : (
                <AdminField
                  name="subjectId"
                  label={t("Subjek")}
                  hint={t("Materi_akan_ditempatkan_di_topik_dan_subjek_yang_Anda_pilih")}
                >
                  <NativeSelect required defaultValue="">
                    <option value="" disabled>
                      {t("Pilih_subjek")}
                    </option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.topic?.title ?? t("Topik")} / {subject.title}
                        {!subject.published || !subject.topic?.published ? t("DraftSuffix") : ""}
                      </option>
                    ))}
                  </NativeSelect>
                </AdminField>
              )}
              <AdminField name="title" label={t("Judul_materi")}>
                <Input required maxLength={160} defaultValue={source?.title} />
              </AdminField>
              <AdminField name="description" label={t("Deskripsi")}>
                <Textarea required maxLength={500} defaultValue={source?.description} />
              </AdminField>
              <AdminField
                name="file"
                label={source ? t("Ganti_isi_dari_Word_opsional") : t("Dokumen_Word_docx")}
                hint={
                  source
                    ? t(
                        "Biarkan_kosong_untuk_mempertahankan_isi_gambar_tabel_dan_furigana_DOCX_pengganti_maks",
                      )
                    : t("Ukuran_maksimal_10_MiB_Materi_terbit_tetap_tersedia_jika_impor_gagal")
                }
              >
                <Input
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  required={!source}
                />
              </AdminField>
            </FieldGroup>
          </ManagementForm>
        </div>
      ) : null}
      {preview ? (
        <>
          <p className="text-sm text-muted-foreground">
            {t(
              "Draft_sudah_tersimpan_Anda_dapat_meninjaunya_sekarang_atau_membukanya_kembali_dari",
            )}{" "}
            <Link className="underline" href="/admin?section=materials&status=draft">
              {t("daftar_Draft")}
            </Link>
            .
          </p>
          <ReviewDraft
            key={preview.draftId}
            draft={preview}
            onPublished={(material) => {
              setCompleted(true);
              onPublished(material);
            }}
          />
        </>
      ) : null}
    </div>
  );
}

export function MaterialImportForm({
  subjects,
  drafts,
  materials,
  status,
}: {
  subjects: ManagementContent["subjectOptions"];
  drafts: ManagementContent["materialDrafts"];
  materials: ManagementContent["materials"];
  status: MaterialStatus;
}) {
  const t = useTranslations("UI");

  const [published, setPublished] = useState<MaterialDestination | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  return (
    <section className="page-stack">
      {notice ? (
        <Alert variant="success">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      {published ? (
        <Alert variant="success">
          <AlertDescription>
            <p>
              {t("materialPublished", {title: published.title})}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className="inline-flex min-h-11 items-center" href={materialHref(published)}>
                {t("Lihat_materi_di_Belajar")}
              </Link>
              <Link
                className="inline-flex min-h-11 items-center"
                href="/admin?section=materials&status=published"
              >
                {t("Buka_daftar_Materi_terbit")}
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}
      <RecordEditor
        title={t("Tambah_materi")}
        description={t(
          "Impor_Word_DOCX_maksimal_10_MiB_Materi_disimpan_sebagai_draft_sampai_ditinjau_dan_dit",
        )}
        create
      >
        <MaterialEditor subjects={subjects} onPublished={setPublished} />
      </RecordEditor>
      {status === "draft" ? (
        <>
          <h2>{t("Draft_menunggu_tinjauan")}</h2>
          {drafts.length ? (
            <ul className="flex flex-col gap-4">
              {drafts.map((draft) => (
                <DraftReview
                  key={draft.id}
                  draft={draft}
                  subjects={subjects}
                  onPublished={setPublished}
                  onDeleted={setNotice}
                />
              ))}
            </ul>
          ) : (
            <CollectionEmpty
              title={t("Tidak_ada_draft_materi")}
              description={t(
                "Materi_yang_sudah_diterbitkan_tersedia_pada_pilihan_Materi_terbit_Impor_dokumen_baru_",
              )}
            />
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <h2>{t("Materi_terbit")}</h2>
            <p className="text-sm text-muted-foreground">
              {t(
                "Gunakan_Ubah_untuk_memperbarui_judul_deskripsi_atau_isi_dari_Word_Revisi_perlu_ditinj",
              )}
            </p>
          </div>
          {materials.length ? (
            <ul className="flex flex-col gap-4">
              {materials.map((material) => {
                const subject = material.subject;
                const visible = !!subject?.published && !!subject.topic?.published;
                return (
                  <li
                    key={material.id}
                    className="flex flex-col gap-4 rounded-xl border bg-card p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words font-semibold">{material.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t("materialPath", {topic: subject?.topic?.title ?? "", subject: subject?.title ?? ""})}
                        </p>
                      </div>
                      <Badge variant={visible ? "success" : "warning"}>
                        {visible ? t("Terbit") : t("Terbit_lokasi_masih_draft")}
                      </Badge>
                    </div>
                    <p className="break-words text-sm text-muted-foreground">
                      {material.description}
                    </p>
                    {visible && subject?.topic ? (
                      <div>
                        <Link
                          href={materialHref({
                            title: material.title,
                            topicId: subject.topic.id,
                            subjectId: subject.id,
                          })}
                          className={buttonVariants({ variant: "outline" })}
                        >
                          {t("Lihat_materi_di_Belajar")}
                        </Link>
                      </div>
                    ) : (
                      <Alert variant="warning" role="note">
                        <AlertDescription>
                          <p>
                            {t(
                              "Materi_tersimpan_tetapi_belum_tampil_untuk_siswa_karena_topik_atau_subjeknya_masih_dr",
                            )}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {subject?.topic && !subject.topic.published ? (
                              <Link
                                className="inline-flex min-h-11 items-center"
                                href={`/admin?${new URLSearchParams({ section: "topics", q: subject.topic.title })}`}
                              >
                                {t("manageTopic", {title: subject.topic.title})}
                              </Link>
                            ) : null}
                            {subject && !subject.published ? (
                              <Link
                                className="inline-flex min-h-11 items-center"
                                href={`/admin?${new URLSearchParams({ section: "subjects", q: subject.title })}`}
                              >
                                {t("manageSubject", {title: subject.title})}
                              </Link>
                            ) : null}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    <RecordEditor
                      title={material.title}
                      description={t(
                        "Ubah_judul_deskripsi_atau_unggah_Word_pengganti_Simpan_dan_tinjau_draft_revisi_sebelu",
                      )}
                      actions={
                        <DeleteMaterial
                          source={{ ...material, kind: "published" }}
                          onDeleted={setNotice}
                        />
                      }
                    >
                      <MaterialEditor
                        source={{ ...material, kind: "published" }}
                        subjects={subjects}
                        onPublished={setPublished}
                      />
                    </RecordEditor>
                  </li>
                );
              })}
            </ul>
          ) : (
            <CollectionEmpty
              title={t("Belum_ada_materi_terbit_yang_cocok")}
              description={t(
                "Periksa_pilihan_Draft_untuk_materi_yang_baru_diimpor_atau_ubah_kata_pencarian",
              )}
            />
          )}
        </>
      )}
    </section>
  );
}
