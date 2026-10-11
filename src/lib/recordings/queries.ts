import "server-only";
import { db } from "@/prisma/db";

export async function getPublishedRecordings() {
  return db.orm.public.Recording.where({ published: true })
    .select("id", "title", "description", "lessonDate", "url")
    .orderBy((recording) => recording.lessonDate.desc())
    .all();
}

export async function getRecordingDrafts() {
  return db.orm.public.Recording.where({ published: false })
    .select("id", "title", "description", "lessonDate", "url")
    .orderBy((recording) => recording.updatedAt.desc())
    .all();
}
