"use server";

import "server-only";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireAdmin, requireManagement } from "@/lib/auth-session";
import { db } from "@/prisma/db";
import {
  formResult,
  actionFailure,
  FormValidationError,
  parsePracticeQuestions,
} from "./validation";
import { renderLessonHtml } from "@/lib/learn/render";
import { convertLessonDocx } from "@/lib/learn/material-import";

// Match the installed Better Auth/Zod email rules so saved emails work for sign-in.
const accountEmailPattern =
  /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;

function value(form: FormData, key: string, maximum = 2000) {
  const raw = form.get(key);
  const result = typeof raw === "string" ? raw.trim() : "";
  if (!result || result.length > maximum)
    throw new FormValidationError(`Isian wajib diisi dan maksimal ${maximum} karakter.`, key);
  return result;
}

function optionalValue(form: FormData, key: string, maximum = 2000) {
  const raw = form.get(key);
  const result = typeof raw === "string" ? raw.trim() : "";
  if (result.length > maximum) throw new FormValidationError(`Maksimal ${maximum} karakter.`, key);
  return result || null;
}

function slug(input: string, field = "id") {
  const id = input.toLowerCase().replace(/\s+/g, "-");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))
    throw new FormValidationError("Gunakan huruf kecil, angka, dan tanda hubung untuk ID.", field);
  return id;
}

export async function provisionAccount(form: FormData) {
  await requireAdmin();
  return formResult(async () => {
    const name = value(form, "name", 120);
    const email = value(form, "email", 254).toLowerCase();
    const password = value(form, "password", 128);
    const requestedRole = value(form, "role", 16);
    if (!/^(student|teacher)$/.test(requestedRole))
      throw new FormValidationError("Pilih peran siswa atau guru.", "role");
    const role: "student" | "teacher" = requestedRole === "teacher" ? "teacher" : "student";
    if (!accountEmailPattern.test(email))
      throw new FormValidationError("Masukkan email yang valid.", "email");
    if (password.length < 12)
      throw new FormValidationError("Kata sandi minimal 12 karakter.", "password");
    await auth.api.createUser({
      headers: await headers(),
      body: { name, email, password, role },
    });
    revalidatePath("/admin");
  });
}

export async function resetAccountPassword(form: FormData) {
  await requireAdmin();
  return formResult(async () => {
    const userId = value(form, "userId", 80);
    const password = value(form, "password", 128);
    if (password.length < 12)
      throw new FormValidationError("Kata sandi minimal 12 karakter.", "password");
    await auth.api.setUserPassword({
      headers: await headers(),
      body: { newPassword: password, userId },
    });
    await db.orm.public.GenshuSession.where({ userId }).deleteAll();
    revalidatePath("/admin");
  });
}

export async function updateAccount(form: FormData) {
  const session = await requireAdmin();
  return formResult(async () => {
    const userId = value(form, "userId", 80);
    const name = value(form, "name", 120);
    const email = value(form, "email", 254).toLowerCase();
    const role = value(form, "role", 16);
    if (!accountEmailPattern.test(email))
      throw new FormValidationError("Masukkan email yang valid.", "email");
    if (role !== "student" && role !== "teacher")
      throw new FormValidationError("Pilih peran siswa atau guru.", "role");
    if (userId === session.user.id)
      throw new FormValidationError(
        "Akun yang sedang Anda gunakan dilindungi dari perubahan profil dan peran di sini.",
      );
    await db.transaction(async (tx) => {
      const rows = await tx.query(
        tx.sql.public.genshu_user
          .select("id", "email", "role")
          .where((row, fn) => fn.eq(row.id, userId))
          .forUpdate()
          .build(),
      );
      const target = rows[0];
      if (!target) throw new FormValidationError("Akun tidak ditemukan. Muat ulang daftar.");
      if (target.role !== "student" && target.role !== "teacher")
        throw new FormValidationError(
          "Akun administrator dilindungi dari perubahan profil dan peran di sini.",
        );
      const duplicate = await tx.orm.public.GenshuUser.where({ email }).select("id").first();
      if (duplicate && duplicate.id !== userId)
        throw new FormValidationError("Email sudah digunakan akun lain.", "email");
      const emailChanged = target.email !== email;
      await tx.orm.public.GenshuUser.where({ id: userId }).update({
        name,
        email,
        role,
        ...(emailChanged ? { emailVerified: false } : {}),
        updatedAt: new Date().toISOString(),
      });
      if (emailChanged || target.role !== role)
        await tx.orm.public.GenshuSession.where({ userId }).deleteAll();
    });
    revalidatePath("/admin");
  });
}

export async function deleteAccount(form: FormData) {
  const session = await requireAdmin();
  try {
    const userId = value(form, "userId", 80);
    if (userId === session.user.id)
      throw new FormValidationError("Akun yang sedang Anda gunakan tidak dapat dihapus.");
    await db.transaction(async (tx) => {
      const rows = await tx.query(
        tx.sql.public.genshu_user
          .select("id", "role")
          .where((row, fn) => fn.eq(row.id, userId))
          .forUpdate()
          .build(),
      );
      const target = rows[0];
      if (!target)
        throw new FormValidationError(
          "Akun sudah dihapus atau tidak ditemukan. Muat ulang daftar.",
        );
      if (target.role !== "student" && target.role !== "teacher")
        throw new FormValidationError("Akun administrator dilindungi dan tidak dapat dihapus.");
      if (await tx.orm.public.ActivityAttempt.where({ userId }).select("id").first()) {
        throw new FormValidationError(
          "Akun memiliki pengerjaan atau hasil latihan sehingga tidak dapat dihapus. Riwayat siswa tetap dipertahankan.",
        );
      }
      await tx.orm.public.GenshuUser.where({ id: userId }).delete();
    });
    revalidatePath("/admin");
    return { success: true as const, message: "Akun berhasil dihapus." };
  } catch (error) {
    if (error instanceof FormValidationError) return actionFailure(error);
    return {
      success: false as const,
      message: "Akun belum berhasil dihapus. Periksa koneksi dan coba lagi.",
    };
  }
}

export async function saveTopic(form: FormData) {
  await requireManagement();
  return formResult(async () => {
    const id = slug(value(form, "id", 80));
    const originalId = optionalValue(form, "originalId", 80);
    const title = value(form, "title", 160);
    const description = value(form, "description", 500);
    if (originalId) {
      if (id !== originalId)
        throw new FormValidationError("ID topik tidak dapat diubah setelah dibuat.", "id");
      const updated = await db.orm.public.Topic.where({ id: originalId }).update({
        title,
        description,
        published: false,
        updatedAt: new Date().toISOString(),
      });
      if (!updated) throw new FormValidationError("Topik tidak ditemukan.", "id");
    } else await db.orm.public.Topic.create({ id, title, description, published: false });
    revalidatePath("/admin");
    revalidatePath("/learn");
  });
}

export async function saveSubject(form: FormData) {
  await requireManagement();
  return formResult(async () => {
    const id = slug(value(form, "id", 80));
    const originalId = optionalValue(form, "originalId", 80);
    const topicId = slug(value(form, "topicId", 80), "topicId");
    const title = value(form, "title", 160);
    const description = value(form, "description", 500);
    if (!(await db.orm.public.Topic.where({ id: topicId }).first()))
      throw new FormValidationError("Topik tidak ditemukan.", "topicId");
    if (originalId) {
      if (id !== originalId)
        throw new FormValidationError("ID subjek tidak dapat diubah setelah dibuat.", "id");
      const updated = await db.orm.public.Subject.where({ id: originalId }).update({
        topicId,
        title,
        description,
        published: false,
        updatedAt: new Date().toISOString(),
      });
      if (!updated) throw new FormValidationError("Subjek tidak ditemukan.", "id");
    } else
      await db.orm.public.Subject.create({ id, topicId, title, description, published: false });
    revalidatePath("/admin");
    revalidatePath("/learn");
  });
}

async function convertMaterialFile(file: File) {
  try {
    return await convertLessonDocx(file);
  } catch {
    throw new FormValidationError(
      "Dokumen belum dapat diproses. Gunakan DOCX yang valid, berisi materi, dan berukuran maksimal 10 MiB.",
      "file",
    );
  }
}

export async function importMaterial(form: FormData) {
  await requireManagement();
  try {
    const subjectId = slug(value(form, "subjectId", 80), "subjectId");
    const title = value(form, "title", 160);
    const description = value(form, "description", 500);
    const file = form.get("file");
    if (!(file instanceof File))
      throw new FormValidationError("Pilih dokumen Word (.docx).", "file");
    const subject = await db.orm.public.Subject.where({ id: subjectId })
      .select("id", "title", "published")
      .include("topic", (topic) => topic.select("id", "title", "published"))
      .include("material", (material) => material.select("published"))
      .first();
    if (!subject) throw new FormValidationError("Subjek tidak ditemukan.", "subjectId");
    const converted = await convertMaterialFile(file);
    const draft = await db.orm.public.MaterialDraft.create({
      subjectId,
      title,
      description,
      contentHtml: converted.html,
      warnings: converted.warnings,
    });
    revalidatePath("/admin");
    return {
      success: true as const,
      message: "Dokumen berhasil diimpor sebagai draft. Tinjau pratinjau sebelum menerbitkan.",
      preview: {
        draftId: draft.id,
        title,
        description,
        html: converted.html,
        warnings: converted.warnings,
        subjectId: subject.id,
        subjectTitle: subject.title,
        subjectPublished: subject.published,
        topicId: subject.topic?.id ?? "",
        topicTitle: subject.topic?.title ?? "Topik tidak tersedia",
        topicPublished: !!subject.topic?.published,
        replacesPublished: !!subject.material?.published,
      },
    };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function saveMaterialDraft(form: FormData) {
  await requireManagement();
  try {
    const id = value(form, "id", 80);
    const kind = value(form, "kind", 16);
    if (kind !== "draft" && kind !== "published")
      throw new FormValidationError("Jenis materi tidak valid. Muat ulang daftar.");
    const title = value(form, "title", 160);
    const description = value(form, "description", 500);
    const file = form.get("file");
    if (file !== null && !(file instanceof File))
      throw new FormValidationError("Pilih dokumen Word (.docx) yang valid.", "file");
    const converted =
      file instanceof File && (file.name || file.size) ? await convertMaterialFile(file) : null;
    const draft = await db.transaction(async (tx) => {
      const source =
        kind === "draft"
          ? await tx.orm.public.MaterialDraft.where({ id }).first()
          : await tx.orm.public.Material.where({ id, published: true }).first();
      if (!source) throw new FormValidationError("Materi tidak ditemukan. Muat ulang daftar.");
      const data = {
        title,
        description,
        contentHtml: converted?.html ?? source.contentHtml,
        warnings: converted?.warnings ?? source.warnings,
        updatedAt: new Date().toISOString(),
      };
      if (kind === "published")
        return tx.orm.public.MaterialDraft.create({ ...data, subjectId: source.subjectId });
      const updated = await tx.orm.public.MaterialDraft.where({ id }).update(data);
      if (!updated) throw new FormValidationError("Draft tidak ditemukan. Muat ulang daftar.");
      return updated;
    });
    revalidatePath("/admin");
    return {
      success: true as const,
      message: "Perubahan tersimpan sebagai draft. Tinjau dan terbitkan agar tersedia untuk siswa.",
      preview: await previewMaterialDraft(draft.id),
    };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function deleteMaterial(form: FormData) {
  await requireManagement();
  try {
    const id = value(form, "id", 80);
    const kind = value(form, "kind", 16);
    if (kind !== "draft" && kind !== "published")
      throw new FormValidationError("Jenis materi tidak valid. Muat ulang daftar.");
    const deleted =
      kind === "draft"
        ? await db.orm.public.MaterialDraft.where({ id }).delete()
        : await db.orm.public.Material.where({ id, published: true }).delete();
    if (!deleted)
      throw new FormValidationError(
        "Materi sudah dihapus atau tidak ditemukan. Muat ulang daftar.",
      );
    revalidatePath("/admin");
    revalidatePath("/learn", "layout");
    return {
      success: true as const,
      message:
        kind === "draft"
          ? "Draft materi berhasil dihapus. Materi terbit tetap tersedia."
          : "Materi terbit berhasil dihapus dan tidak lagi tersedia untuk siswa. Draft revisi tetap tersimpan.",
    };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function deleteContent(form: FormData) {
  await requireManagement();
  try {
    const id = value(form, "id", 80);
    const kind = value(form, "kind", 30);
    if (!["topic", "subject", "activity", "announcement", "recording", "event"].includes(kind)) {
      throw new FormValidationError("Jenis konten tidak valid. Muat ulang daftar.");
    }
    await db.transaction(async (tx) => {
      let deleted: unknown;
      // Lock parents before checking children so concurrent inserts cannot be cascaded away.
      if (kind === "topic") {
        const rows = await tx.query(
          tx.sql.public.Topic.select("id")
            .where((row, fn) => fn.eq(row.id, id))
            .forUpdate()
            .build(),
        );
        if (!rows.length)
          throw new FormValidationError(
            "Konten sudah dihapus atau tidak ditemukan. Muat ulang daftar.",
          );
        if (await tx.orm.public.Subject.where({ topicId: id }).select("id").first()) {
          throw new FormValidationError(
            "Topik masih memiliki subjek. Hapus atau pindahkan semua subjek terlebih dahulu melalui bagian Subjek.",
          );
        }
        deleted = await tx.orm.public.Topic.where({ id }).delete();
      } else if (kind === "subject") {
        const rows = await tx.query(
          tx.sql.public.Subject.select("id")
            .where((row, fn) => fn.eq(row.id, id))
            .forUpdate()
            .build(),
        );
        if (!rows.length)
          throw new FormValidationError(
            "Konten sudah dihapus atau tidak ditemukan. Muat ulang daftar.",
          );
        const material = await tx.orm.public.Material.where({ subjectId: id }).select("id").first();
        const draft = await tx.orm.public.MaterialDraft.where({ subjectId: id })
          .select("id")
          .first();
        if (material || draft) {
          throw new FormValidationError(
            "Subjek masih memiliki materi atau draft. Hapus materi dan draft terlebih dahulu melalui bagian Materi.",
          );
        }
        deleted = await tx.orm.public.Subject.where({ id }).delete();
      } else if (kind === "activity") {
        const rows = await tx.query(
          tx.sql.public.Activity.select("id", "type")
            .where((row, fn) => fn.eq(row.id, id))
            .forUpdate()
            .build(),
        );
        if (!rows.length || rows[0].type !== "practice")
          throw new FormValidationError(
            "Latihan sudah dihapus atau tidak ditemukan. Muat ulang daftar.",
          );
        if (await tx.orm.public.ActivityAttempt.where({ activityId: id }).select("id").first()) {
          throw new FormValidationError(
            "Latihan sudah memiliki pengerjaan atau hasil siswa sehingga tidak dapat dihapus. Riwayat siswa tetap dipertahankan.",
          );
        }
        deleted = await tx.orm.public.Activity.where({ id, type: "practice" }).delete();
      } else if (kind === "announcement")
        deleted = await tx.orm.public.Announcement.where({ id }).delete();
      else if (kind === "recording") deleted = await tx.orm.public.Recording.where({ id }).delete();
      else if (kind === "event") deleted = await tx.orm.public.CalendarEvent.where({ id }).delete();
      if (!deleted)
        throw new FormValidationError(
          "Konten sudah dihapus atau tidak ditemukan. Muat ulang daftar.",
        );
    });
    revalidatePath("/admin");
    revalidatePath("/");
    if (kind === "topic" || kind === "subject") revalidatePath("/learn", "layout");
    else if (kind === "activity") revalidatePath("/activities", "layout");
    else if (kind === "announcement") revalidatePath("/announcements", "layout");
    else if (kind === "recording") revalidatePath("/recording");
    else if (kind === "event") revalidatePath("/calendar");
    return { success: true as const, message: "Konten berhasil dihapus." };
  } catch (error) {
    if (error instanceof FormValidationError) return actionFailure(error);
    return {
      success: false as const,
      message: "Konten belum berhasil dihapus. Periksa koneksi dan coba lagi.",
    };
  }
}

export async function publishMaterialDraft(draftId: string) {
  await requireManagement();
  try {
    if (typeof draftId !== "string" || !draftId) throw new Error("Invalid material draft");
    const material = await db.transaction(async (tx) => {
      const draft = await tx.orm.public.MaterialDraft.where({ id: draftId }).first();
      if (!draft) throw new Error("Material draft not found");
      const subject = await tx.orm.public.Subject.where({ id: draft.subjectId, published: true })
        .include("topic", (topic) => topic.select("id", "published"))
        .first();
      if (!subject?.topic?.published)
        throw new FormValidationError(
          "Terbitkan topik dan subjek terlebih dahulu sebelum menerbitkan materi ini.",
          "subjectId",
        );
      const existing = await tx.orm.public.Material.where({ subjectId: draft.subjectId }).first();
      const data = {
        title: draft.title,
        description: draft.description,
        contentHtml: draft.contentHtml,
        warnings: draft.warnings,
        published: true,
        updatedAt: new Date().toISOString(),
      };
      if (existing) await tx.orm.public.Material.where({ subjectId: draft.subjectId }).update(data);
      else await tx.orm.public.Material.create({ ...data, subjectId: draft.subjectId });
      await tx.orm.public.MaterialDraft.where({ id: draftId }).delete();
      return { title: draft.title, topicId: subject.topic.id, subjectId: subject.id };
    });
    revalidatePath("/learn", "layout");
    revalidatePath("/admin");
    return { success: true as const, message: "Materi berhasil diterbitkan.", material };
  } catch (error) {
    return actionFailure(error);
  }
}

export async function publishContent(form: FormData) {
  await requireManagement();
  return formResult(async () => {
    const kind = value(form, "kind", 30);
    const id = value(form, "id", 80);
    let updated: unknown;
    if (kind === "topic")
      updated = await db.orm.public.Topic.where({ id }).update({ published: true });
    else if (kind === "subject")
      updated = await db.orm.public.Subject.where({ id }).update({ published: true });
    else if (kind === "announcement")
      updated = await db.orm.public.Announcement.where({ id }).update({
        published: true,
        publishedAt: new Date().toISOString(),
      });
    else if (kind === "recording")
      updated = await db.orm.public.Recording.where({ id }).update({ published: true });
    else if (kind === "event")
      updated = await db.orm.public.CalendarEvent.where({ id }).update({ published: true });
    else if (kind === "activity") {
      updated = await db.transaction(async (tx) => {
        const activity = await tx.orm.public.Activity.where({ id, type: "practice" }).first();
        const questions = await tx.orm.public.ActivityQuestion.where({ activityId: id })
          .select("id")
          .all();
        if (!activity || !questions.length)
          throw new FormValidationError(
            "Tambahkan minimal satu soal sebelum menerbitkan latihan.",
            "questions",
          );
        return tx.orm.public.Activity.where({ id }).update({ published: true });
      });
    } else throw new Error("Unsupported publication type");
    if (!updated) throw new Error("Content item not found");
    revalidatePath("/learn");
    revalidatePath("/activities");
    revalidatePath("/announcements");
    revalidatePath("/recording");
    revalidatePath("/calendar");
    revalidatePath("/admin");
    revalidatePath("/");
  });
}

export async function saveAnnouncement(form: FormData) {
  await requireManagement();
  return formResult(async () => {
    const id = optionalValue(form, "id", 80);
    const title = value(form, "title", 160);
    const summary = value(form, "summary", 400);
    const content = value(form, "content", 20000);
    const data = {
      title,
      summary,
      content,
      published: false,
      publishedAt: null,
      updatedAt: new Date().toISOString(),
    };
    if (id) {
      const updated = await db.orm.public.Announcement.where({ id }).update(data);
      if (!updated) throw new FormValidationError("Konten tidak ditemukan. Muat ulang daftar.");
    } else await db.orm.public.Announcement.create(data);
    revalidatePath("/admin");
    revalidatePath("/announcements");
    revalidatePath("/");
  });
}

function tokyoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new FormValidationError("Masukkan tanggal yang valid.", "lessonDate");
  const date = new Date(`${value}T00:00:00+09:00`);
  if (
    Number.isNaN(date.getTime()) ||
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date) !== value
  )
    throw new FormValidationError("Masukkan tanggal yang valid.", "lessonDate");
  return date.toISOString();
}

function tokyoDateTime(value: string, field: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
    throw new FormValidationError("Masukkan tanggal dan waktu yang valid.", field);
  const date = new Date(`${value}:00+09:00`);
  if (
    Number.isNaN(date.getTime()) ||
    new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .format(date)
      .replace(" ", "T") !== value
  )
    throw new FormValidationError("Masukkan tanggal dan waktu yang valid.", field);
  return date.toISOString();
}

function externalHttpsUrl(input: string) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new FormValidationError("Masukkan alamat video yang valid.", "url");
  }
  if (url.protocol !== "https:" || url.username || url.password)
    throw new FormValidationError(
      "Gunakan tautan HTTPS tanpa nama pengguna atau kata sandi di dalamnya.",
      "url",
    );
  return url.toString();
}

export async function saveRecording(form: FormData) {
  await requireManagement();
  return formResult(async () => {
    const id = optionalValue(form, "id", 80);
    const title = value(form, "title", 160);
    const description = value(form, "description", 1000);
    const lessonDate = tokyoDate(value(form, "lessonDate", 10));
    const url = externalHttpsUrl(value(form, "url", 2048));
    const data = {
      title,
      description,
      lessonDate,
      url,
      published: false,
      updatedAt: new Date().toISOString(),
    };
    if (id) {
      const updated = await db.orm.public.Recording.where({ id }).update(data);
      if (!updated) throw new FormValidationError("Konten tidak ditemukan. Muat ulang daftar.");
    } else await db.orm.public.Recording.create(data);
    revalidatePath("/admin");
    revalidatePath("/recording");
    revalidatePath("/");
  });
}

export async function saveEvent(form: FormData) {
  await requireManagement();
  return formResult(async () => {
    const id = optionalValue(form, "id", 80);
    const title = value(form, "title", 160);
    const details = value(form, "details", 4000);
    const startsAt = tokyoDateTime(value(form, "startsAt", 16), "startsAt");
    const endsAt = tokyoDateTime(value(form, "endsAt", 16), "endsAt");
    if (new Date(endsAt) <= new Date(startsAt))
      throw new FormValidationError("Waktu selesai harus setelah waktu mulai.", "endsAt");
    const data = {
      title,
      details,
      startsAt,
      endsAt,
      published: false,
      updatedAt: new Date().toISOString(),
    };
    if (id) {
      const updated = await db.orm.public.CalendarEvent.where({ id }).update(data);
      if (!updated) throw new FormValidationError("Konten tidak ditemukan. Muat ulang daftar.");
    } else await db.orm.public.CalendarEvent.create(data);
    revalidatePath("/admin");
    revalidatePath("/calendar");
    revalidatePath("/");
  });
}

export async function savePractice(form: FormData) {
  await requireManagement();
  return formResult(async () => {
    const id = optionalValue(form, "id", 80);
    const title = value(form, "title", 160);
    const description = value(form, "description", 500);
    const questions = parsePracticeQuestions(form.get("questions"));
    if (id) {
      const existing = await db.orm.public.Activity.where({ id, type: "practice" }).first();
      if (!existing) throw new Error("Practice activity not found");
      await db.transaction(async (tx) => {
        await tx.orm.public.Activity.where({ id }).update({
          title,
          description,
          published: false,
          updatedAt: new Date().toISOString(),
        });
        await tx.orm.public.ActivityQuestion.where({ activityId: id }).deleteAll();
        for (const [position, question] of questions.entries()) {
          await tx.orm.public.ActivityQuestion.create({ activityId: id, position, ...question });
        }
      });
    } else
      await db.transaction(async (tx) => {
        const activity = await tx.orm.public.Activity.create({
          type: "practice",
          title,
          description,
          published: false,
        });
        for (const [position, question] of questions.entries()) {
          await tx.orm.public.ActivityQuestion.create({
            activityId: activity.id,
            position,
            ...question,
          });
        }
      });
    revalidatePath("/admin");
    revalidatePath("/activities");
  });
}

export async function previewMaterialDraft(draftId: string) {
  await requireManagement();
  if (typeof draftId !== "string" || !draftId || draftId.length > 80)
    throw new Error("Draft tidak valid");
  const draft = await db.orm.public.MaterialDraft.where({ id: draftId })
    .include("subject", (subject) =>
      subject
        .select("id", "title", "published")
        .include("topic", (topic) => topic.select("id", "title", "published"))
        .include("material", (material) => material.select("published")),
    )
    .first();
  if (!draft) throw new Error("Draft tidak ditemukan");
  return {
    draftId: draft.id,
    title: draft.title,
    description: draft.description,
    html: renderLessonHtml(draft.contentHtml).html,
    warnings: Array.isArray(draft.warnings) ? draft.warnings.map(String) : [],
    replacesPublished: !!draft.subject?.material?.published,
    subjectId: draft.subject?.id ?? "",
    subjectTitle: draft.subject?.title ?? "Subjek tidak tersedia",
    subjectPublished: !!draft.subject?.published,
    topicId: draft.subject?.topic?.id ?? "",
    topicTitle: draft.subject?.topic?.title ?? "Topik tidak tersedia",
    topicPublished: !!draft.subject?.topic?.published,
  };
}
