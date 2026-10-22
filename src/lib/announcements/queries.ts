import "server-only";
import { db } from "@/prisma/db";

export async function getPublishedAnnouncements(limit = 10) {
  return db.orm.public.Announcement.where({ published: true })
    .select("id", "title", "summary", "publishedAt")
    .orderBy((announcement) => announcement.publishedAt.desc())
    .limit(limit)
    .all();
}

export async function getPublishedAnnouncement(id: string) {
  return db.orm.public.Announcement.where({ id, published: true })
    .select("id", "title", "summary", "content", "publishedAt")
    .first();
}

export async function getAnnouncementDrafts() {
  return db.orm.public.Announcement.where({ published: false })
    .select("id", "title", "summary", "content", "createdAt")
    .orderBy((announcement) => announcement.updatedAt.desc())
    .all();
}
