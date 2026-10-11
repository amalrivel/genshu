"use server";

import "server-only";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireAdmin, requireManagement } from "@/lib/auth-session";
import { db } from "@/prisma/db";
import { convertLessonDocx } from "@/lib/learn/material-import";

function value(form: FormData, key: string, maximum = 2000) {
  const result = String(form.get(key) ?? "").trim();
  if (!result || result.length > maximum) throw new Error(`Enter a value for ${key} (up to ${maximum} characters)`);
  return result;
}

function optionalValue(form: FormData, key: string, maximum = 2000) {
  const result = String(form.get(key) ?? "").trim();
  if (result.length > maximum) throw new Error(`${key} is too long`);
  return result || null;
}

function slug(input: string) {
  const id = input.toLowerCase().replace(/\s+/g, "-");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error("Use a topic or subject ID with lowercase letters, numbers, and hyphens");
  return id;
}

export async function provisionAccount(form: FormData) {
  await requireAdmin();
  const name = value(form, "name", 120);
  const email = value(form, "email", 254).toLowerCase();
  const password = value(form, "password", 128);
  const requestedRole = value(form, "role", 16);
  if (!/^(student|teacher)$/.test(requestedRole)) throw new Error("Only student or teacher accounts can be provisioned here");
  const role: "student" | "teacher" = requestedRole === "teacher" ? "teacher" : "student";
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12) {
    throw new Error("Enter a valid email, a password of at least 12 characters, and a student or teacher role");
  }
  await auth.api.createUser({
    headers: await headers(),
    body: { name, email, password, role },
  });
  revalidatePath("/admin");
}

export async function resetAccountPassword(form: FormData) {
  await requireAdmin();
  const userId = value(form, "userId", 80);
  const password = value(form, "password", 128);
  if (password.length < 12) throw new Error("Password must contain at least 12 characters");
  await auth.api.setUserPassword({ headers: await headers(), body: { newPassword: password, userId } });
  await db.orm.public.GenshuSession.where({ userId }).deleteAll();
  revalidatePath("/admin");
}

export async function saveTopic(form: FormData) {
  await requireManagement();
  const id = slug(value(form, "id", 80));
  const originalId = optionalValue(form, "originalId", 80);
  const title = value(form, "title", 160);
  const description = value(form, "description", 500);
  if (originalId) {
    if (id !== originalId) throw new Error("Topic IDs cannot be changed after creation");
    const updated = await db.orm.public.Topic.where({ id: originalId }).update({ title, description, published: false, updatedAt: new Date().toISOString() });
    if (!updated) throw new Error("Topic not found");
  } else await db.orm.public.Topic.create({ id, title, description, published: false });
  revalidatePath("/admin");
  revalidatePath("/learn");
}

export async function saveSubject(form: FormData) {
  await requireManagement();
  const id = slug(value(form, "id", 80));
  const originalId = optionalValue(form, "originalId", 80);
  const topicId = slug(value(form, "topicId", 80));
  const title = value(form, "title", 160);
  const description = value(form, "description", 500);
  if (!(await db.orm.public.Topic.where({ id: topicId }).first())) throw new Error("Topic not found");
  if (originalId) {
    if (id !== originalId) throw new Error("Subject IDs cannot be changed after creation");
    const updated = await db.orm.public.Subject.where({ id: originalId }).update({ topicId, title, description, published: false, updatedAt: new Date().toISOString() });
    if (!updated) throw new Error("Subject not found");
  } else await db.orm.public.Subject.create({ id, topicId, title, description, published: false });
  revalidatePath("/admin");
  revalidatePath("/learn");
}

export async function importMaterial(form: FormData) {
  await requireManagement();
  const subjectId = slug(value(form, "subjectId", 80));
  const title = value(form, "title", 160);
  const description = value(form, "description", 500);
  const file = form.get("file");
  if (!(file instanceof File)) throw new Error("Choose a Word document");
  const subject = await db.orm.public.Subject.where({ id: subjectId }).first();
  if (!subject) throw new Error("Subject not found");
  const converted = await convertLessonDocx(file);
  const draft = await db.orm.public.MaterialDraft.create({
    subjectId, title, description, contentHtml: converted.html, warnings: converted.warnings,
  });
  revalidatePath("/admin");
  return { draftId: draft.id, title, description, html: converted.html, warnings: converted.warnings };
}

export async function publishMaterialDraft(draftId: string) {
  await requireManagement();
  if (typeof draftId !== "string" || !draftId) throw new Error("Invalid material draft");
  await db.transaction(async (tx) => {
    const draft = await tx.orm.public.MaterialDraft.where({ id: draftId }).first();
    if (!draft) throw new Error("Material draft not found");
    const subject = await tx.orm.public.Subject.where({ id: draft.subjectId, published: true })
      .include("topic", (topic) => topic.select("id", "published"))
      .first();
    if (!subject?.topic?.published) throw new Error("Publish the topic and subject before publishing this material");
    const existing = await tx.orm.public.Material.where({ subjectId: draft.subjectId }).first();
    const data = { title: draft.title, description: draft.description, contentHtml: draft.contentHtml, warnings: draft.warnings, published: true, updatedAt: new Date().toISOString() };
    if (existing) await tx.orm.public.Material.where({ subjectId: draft.subjectId }).update(data);
    else await tx.orm.public.Material.create({ ...data, subjectId: draft.subjectId });
    await tx.orm.public.MaterialDraft.where({ id: draftId }).delete();
  });
  revalidatePath("/learn");
  revalidatePath("/admin");
}

export async function publishContent(form: FormData) {
  await requireManagement();
  const kind = value(form, "kind", 30);
  const id = value(form, "id", 80);
  let updated: unknown;
  if (kind === "topic") updated = await db.orm.public.Topic.where({ id }).update({ published: true });
  else if (kind === "subject") updated = await db.orm.public.Subject.where({ id }).update({ published: true });
  else if (kind === "announcement") updated = await db.orm.public.Announcement.where({ id }).update({ published: true, publishedAt: new Date().toISOString() });
  else if (kind === "recording") updated = await db.orm.public.Recording.where({ id }).update({ published: true });
  else if (kind === "event") updated = await db.orm.public.CalendarEvent.where({ id }).update({ published: true });
  else if (kind === "activity") {
    updated = await db.transaction(async (tx) => {
      const activity = await tx.orm.public.Activity.where({ id, type: "practice" }).first();
      const questions = await tx.orm.public.ActivityQuestion.where({ activityId: id }).select("id").all();
      if (!activity || !questions.length) throw new Error("Practice needs at least one question before publication");
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
}

export async function saveAnnouncement(form: FormData) {
  await requireManagement();
  const id = optionalValue(form, "id", 80);
  const title = value(form, "title", 160);
  const summary = value(form, "summary", 400);
  const content = value(form, "content", 20000);
  const data = { title, summary, content, published: false, publishedAt: null, updatedAt: new Date().toISOString() };
  if (id) await db.orm.public.Announcement.where({ id }).update(data);
  else await db.orm.public.Announcement.create(data);
  revalidatePath("/admin");
}

function tokyoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Enter a valid date");
  const date = new Date(`${value}T00:00:00+09:00`);
  if (Number.isNaN(date.getTime()) || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date) !== value) throw new Error("Enter a valid date");
  return date.toISOString();
}

function tokyoDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Enter a valid date and time");
  const date = new Date(`${value}:00+09:00`);
  if (Number.isNaN(date.getTime()) || new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date).replace(" ", "T") !== value) throw new Error("Enter a valid date and time");
  return date.toISOString();
}

function externalHttpsUrl(input: string) {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error("Enter a valid recording URL"); }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("Use an HTTPS video link without embedded credentials");
  return url.toString();
}

export async function saveRecording(form: FormData) {
  await requireManagement();
  const id = optionalValue(form, "id", 80);
  const title = value(form, "title", 160);
  const description = value(form, "description", 1000);
  const lessonDate = tokyoDate(value(form, "lessonDate", 10));
  const url = externalHttpsUrl(value(form, "url", 2048));
  const data = { title, description, lessonDate, url, published: false, updatedAt: new Date().toISOString() };
  if (id) await db.orm.public.Recording.where({ id }).update(data);
  else await db.orm.public.Recording.create(data);
  revalidatePath("/admin");
}

export async function saveEvent(form: FormData) {
  await requireManagement();
  const id = optionalValue(form, "id", 80);
  const title = value(form, "title", 160);
  const details = value(form, "details", 4000);
  const startsAt = tokyoDateTime(value(form, "startsAt", 16));
  const endsAt = tokyoDateTime(value(form, "endsAt", 16));
  if (new Date(endsAt) <= new Date(startsAt)) throw new Error("End time must be after start time");
  const data = { title, details, startsAt, endsAt, published: false, updatedAt: new Date().toISOString() };
  if (id) await db.orm.public.CalendarEvent.where({ id }).update(data);
  else await db.orm.public.CalendarEvent.create(data);
  revalidatePath("/admin");
}

export async function savePractice(form: FormData) {
  await requireManagement();
  const id = optionalValue(form, "id", 80);
  const title = value(form, "title", 160);
  const description = value(form, "description", 500);
  const questionLines = value(form, "questions", 20000).split("\n").map((line) => line.trim()).filter(Boolean);
  const questions = questionLines.map((line) => {
    const separator = line.indexOf("|");
    const answer = line.slice(0, separator).trim().toLowerCase();
    const question = line.slice(separator + 1).trim();
    if (separator < 1 || !["true", "false"].includes(answer) || !question || question.length > 1000) throw new Error("Each line must be true|Question or false|Question");
    return { question, correctAnswer: answer === "true" };
  });
  if (!questions.length) throw new Error("Add at least one question");
  if (id) {
    const existing = await db.orm.public.Activity.where({ id, type: "practice" }).first();
    if (!existing) throw new Error("Practice activity not found");
    await db.transaction(async (tx) => {
      await tx.orm.public.Activity.where({ id }).update({ title, description, published: false, updatedAt: new Date().toISOString() });
      await tx.orm.public.ActivityQuestion.where({ activityId: id }).deleteAll();
      for (const [position, question] of questions.entries()) {
        await tx.orm.public.ActivityQuestion.create({ activityId: id, position, ...question });
      }
    });
  } else await db.transaction(async (tx) => {
    const activity = await tx.orm.public.Activity.create({ type: "practice", title, description, published: false });
    for (const [position, question] of questions.entries()) {
      await tx.orm.public.ActivityQuestion.create({ activityId: activity.id, position, ...question });
    }
  });
  revalidatePath("/admin");
  revalidatePath("/activities");
}
