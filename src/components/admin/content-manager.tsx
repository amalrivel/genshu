import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { ContentPublishControls } from "./content-publish-controls";
import { ContentDeleteControls } from "./content-delete-controls";
import { AdminField, ManagementForm, RecordEditor } from "./management-form";
import { QuestionEditor } from "./question-editor";
import {
  saveAnnouncement,
  saveEvent,
  savePractice,
  saveRecording,
  saveSubject,
  saveTopic,
} from "@/lib/admin/actions";
import type { ManagementContent, ManagementSection } from "@/lib/admin/types";

function RecordRow({
  title,
  description,
  published,
  kind,
  id,
  children,
}: {
  title: string;
  description?: string;
  published: boolean;
  kind: string;
  id: string;
  children: ReactNode;
}) {
  const t = useTranslations("UI");

  return (
    <li className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-semibold">{title}</h3>
          {description ? (
            <p className="mt-1 break-words text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Badge variant={published ? "success" : "warning"}>
          {published ? t("Terbit") : t("Draft")}
        </Badge>
      </div>
      <RecordEditor
        title={title}
        actions={
          <>
            {!published ? <ContentPublishControls kind={kind} id={id} title={title} /> : null}
            <ContentDeleteControls kind={kind} id={id} title={title} />
          </>
        }
      >
        {children}
      </RecordEditor>
    </li>
  );
}

function dateOnly(instant?: string) {
  return instant
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(instant))
    : "";
}
function dateTime(instant?: string) {
  return instant
    ? new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .format(new Date(instant))
        .replace(" ", "T")
    : "";
}

export function ContentManager({
  content,
  section,
}: {
  content: ManagementContent;
  section: ManagementSection;
}) {
  const t = useTranslations("UI");

  if (section === "topics") {
    const form = (topic?: ManagementContent["topics"][number]) => (
      <ManagementForm action={saveTopic} resetOnSuccess={!topic} published={topic?.published}>
        <FieldGroup>
          {topic ? <input type="hidden" name="originalId" value={topic.id} /> : null}
          <AdminField
            name="id"
            label={t("ID_topik")}
            hint={t("Huruf_kecil_angka_dan_tanda_hubung_ID_tidak_dapat_diubah_setelah_dibuat")}
          >
            <Input required maxLength={80} defaultValue={topic?.id} readOnly={!!topic} />
          </AdminField>
          <AdminField name="title" label={t("Judul_topik")}>
            <Input required maxLength={160} defaultValue={topic?.title} />
          </AdminField>
          <AdminField name="description" label={t("Deskripsi")}>
            <Textarea required maxLength={500} defaultValue={topic?.description} />
          </AdminField>
        </FieldGroup>
      </ManagementForm>
    );
    return (
      <div className="page-stack">
        <RecordEditor title={t("Tambah_topik")} create>
          {form()}
        </RecordEditor>
        {content.topics.length ? (
          <ul className="flex flex-col gap-3">
            {content.topics.map((topic) => (
              <RecordRow key={topic.id} {...topic} kind="topic">
                {form(topic)}
              </RecordRow>
            ))}
          </ul>
        ) : (
          <CollectionEmpty
            title={t("Topik_tidak_ditemukan")}
            description={t("Tambahkan_topik_baru_atau_ubah_kata_pencarian")}
          />
        )}
      </div>
    );
  }
  if (section === "subjects") {
    const form = (subject?: ManagementContent["subjects"][number]) => (
      <ManagementForm action={saveSubject} resetOnSuccess={!subject} published={subject?.published}>
        <FieldGroup>
          {subject ? <input type="hidden" name="originalId" value={subject.id} /> : null}
          <AdminField name="topicId" label={t("Topik")}>
            <NativeSelect required defaultValue={subject?.topicId ?? ""}>
              <option value="" disabled>
                {t("Pilih_topik")}
              </option>
              {content.topicOptions.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.title}
                </option>
              ))}
            </NativeSelect>
          </AdminField>
          <AdminField
            name="id"
            label={t("ID_subjek")}
            hint={t("ID_tidak_dapat_diubah_setelah_dibuat")}
          >
            <Input required maxLength={80} defaultValue={subject?.id} readOnly={!!subject} />
          </AdminField>
          <AdminField name="title" label={t("Judul_subjek")}>
            <Input required maxLength={160} defaultValue={subject?.title} />
          </AdminField>
          <AdminField name="description" label={t("Deskripsi")}>
            <Textarea required maxLength={500} defaultValue={subject?.description} />
          </AdminField>
        </FieldGroup>
      </ManagementForm>
    );
    return (
      <div className="page-stack">
        <RecordEditor title={t("Tambah_subjek")} create>
          {form()}
        </RecordEditor>
        {content.subjects.length ? (
          <ul className="flex flex-col gap-3">
            {content.subjects.map((subject) => (
              <RecordRow
                key={subject.id}
                {...subject}
                description={`${subject.topic?.title ?? t("Topik")} · ${subject.description}`}
                kind="subject"
              >
                {form(subject)}
              </RecordRow>
            ))}
          </ul>
        ) : (
          <CollectionEmpty
            title={t("Subjek_tidak_ditemukan")}
            description={t("Tambahkan_subjek_baru_atau_ubah_kata_pencarian")}
          />
        )}
      </div>
    );
  }
  if (section === "practice") {
    const form = (activity?: ManagementContent["activities"][number]) => (
      <ManagementForm
        action={savePractice}
        resetOnSuccess={!activity}
        published={activity?.published}
      >
        <FieldGroup>
          {activity ? <input type="hidden" name="id" value={activity.id} /> : null}
          <AdminField name="title" label={t("Judul_latihan")}>
            <Input required maxLength={160} defaultValue={activity?.title} />
          </AdminField>
          <AdminField name="description" label={t("Deskripsi")}>
            <Textarea required maxLength={500} defaultValue={activity?.description} />
          </AdminField>
          <QuestionEditor initialQuestions={activity?.questions} />
        </FieldGroup>
      </ManagementForm>
    );
    return (
      <div className="page-stack">
        <p className="text-sm text-muted-foreground">
          {t(
            "Perubahan_soal_berlaku_untuk_latihan_baru_Latihan_siswa_yang_sudah_dimulai_tetap_meng",
          )}
        </p>
        <RecordEditor title={t("Tambah_latihan")} create>
          {form()}
        </RecordEditor>
        {content.activities.length ? (
          <ul className="flex flex-col gap-3">
            {content.activities.map((activity) => (
              <RecordRow
                key={activity.id}
                {...activity}
                description={t("practiceDescription", {
                  count: activity.questions.length,
                  description: activity.description,
                })}
                kind="activity"
              >
                {form(activity)}
              </RecordRow>
            ))}
          </ul>
        ) : (
          <CollectionEmpty
            title={t("Latihan_tidak_ditemukan")}
            description={t("Tambahkan_latihan_baru_atau_ubah_kata_pencarian")}
          />
        )}
      </div>
    );
  }
  if (section === "announcements") {
    const form = (item?: ManagementContent["announcements"][number]) => (
      <ManagementForm action={saveAnnouncement} resetOnSuccess={!item} published={item?.published}>
        <FieldGroup>
          {item ? <input type="hidden" name="id" value={item.id} /> : null}
          <AdminField name="title" label={t("Judul_pengumuman")}>
            <Input required maxLength={160} defaultValue={item?.title} />
          </AdminField>
          <AdminField name="summary" label={t("Ringkasan")}>
            <Textarea required maxLength={400} defaultValue={item?.summary} />
          </AdminField>
          <AdminField name="content" label={t("Isi_pengumuman")}>
            <Textarea required rows={8} maxLength={20000} defaultValue={item?.content} />
          </AdminField>
        </FieldGroup>
      </ManagementForm>
    );
    return (
      <div className="page-stack">
        <RecordEditor title={t("Tambah_pengumuman")} create>
          {form()}
        </RecordEditor>
        {content.announcements.length ? (
          <ul className="flex flex-col gap-3">
            {content.announcements.map((item) => (
              <RecordRow key={item.id} {...item} description={item.summary} kind="announcement">
                {form(item)}
              </RecordRow>
            ))}
          </ul>
        ) : (
          <CollectionEmpty
            title={t("Pengumuman_tidak_ditemukan")}
            description={t("Tambahkan_pengumuman_baru_atau_ubah_kata_pencarian")}
          />
        )}
      </div>
    );
  }
  if (section === "recordings") {
    const form = (item?: ManagementContent["recordings"][number]) => (
      <ManagementForm action={saveRecording} resetOnSuccess={!item} published={item?.published}>
        <FieldGroup>
          {item ? <input type="hidden" name="id" value={item.id} /> : null}
          <AdminField name="title" label={t("Judul_rekaman")}>
            <Input required maxLength={160} defaultValue={item?.title} />
          </AdminField>
          <AdminField name="description" label={t("Deskripsi")}>
            <Textarea required maxLength={1000} defaultValue={item?.description} />
          </AdminField>
          <AdminField
            name="lessonDate"
            label={t("Tanggal_kelas")}
            hint={t("Tanggal_mengikuti_waktu_Jepang_Asia_Tokyo")}
          >
            <Input type="date" required defaultValue={dateOnly(item?.lessonDate)} />
          </AdminField>
          <AdminField name="url" label={t("Tautan_video_HTTPS")}>
            <Input
              type="url"
              required
              maxLength={2048}
              placeholder="https://…"
              defaultValue={item?.url}
            />
          </AdminField>
        </FieldGroup>
      </ManagementForm>
    );
    return (
      <div className="page-stack">
        <RecordEditor title={t("Tambah_rekaman")} create>
          {form()}
        </RecordEditor>
        {content.recordings.length ? (
          <ul className="flex flex-col gap-3">
            {content.recordings.map((item) => (
              <RecordRow key={item.id} {...item} kind="recording">
                {form(item)}
              </RecordRow>
            ))}
          </ul>
        ) : (
          <CollectionEmpty
            title={t("Rekaman_tidak_ditemukan")}
            description={t("Tambahkan_rekaman_baru_atau_ubah_kata_pencarian")}
          />
        )}
      </div>
    );
  }
  if (section === "events") {
    const form = (item?: ManagementContent["events"][number]) => (
      <ManagementForm action={saveEvent} resetOnSuccess={!item} published={item?.published}>
        <FieldGroup>
          {item ? <input type="hidden" name="id" value={item.id} /> : null}
          <AdminField name="title" label={t("Judul_kegiatan")}>
            <Input required maxLength={160} defaultValue={item?.title} />
          </AdminField>
          <AdminField name="details" label={t("Keterangan")}>
            <Textarea required maxLength={4000} defaultValue={item?.details} />
          </AdminField>
          <AdminField name="startsAt" label={t("Waktu_mulai")} hint={t("Waktu_Jepang_Asia_Tokyo")}>
            <Input type="datetime-local" required defaultValue={dateTime(item?.startsAt)} />
          </AdminField>
          <AdminField
            name="endsAt"
            label={t("Waktu_selesai")}
            hint={t("Harus_setelah_waktu_mulai_dalam_waktu_Jepang")}
          >
            <Input type="datetime-local" required defaultValue={dateTime(item?.endsAt)} />
          </AdminField>
        </FieldGroup>
      </ManagementForm>
    );
    return (
      <div className="page-stack">
        <RecordEditor title={t("Tambah_kegiatan")} create>
          {form()}
        </RecordEditor>
        {content.events.length ? (
          <ul className="flex flex-col gap-3">
            {content.events.map((item) => (
              <RecordRow key={item.id} {...item} description={item.details} kind="event">
                {form(item)}
              </RecordRow>
            ))}
          </ul>
        ) : (
          <CollectionEmpty
            title={t("Jadwal_tidak_ditemukan")}
            description={t("Tambahkan_kegiatan_baru_atau_ubah_kata_pencarian")}
          />
        )}
      </div>
    );
  }
  return null;
}
