import "server-only";
import { db } from "@/prisma/db";

export async function getUpcomingEvents(limit = 20) {
  const now = new Date().toISOString();
  return db.orm.public.CalendarEvent.where({ published: true })
    .where((event) => event.endsAt.gte(now))
    .select("id", "title", "details", "startsAt", "endsAt")
    .orderBy((event) => event.startsAt.asc())
    .limit(limit)
    .all();
}

export async function getEventDrafts() {
  return db.orm.public.CalendarEvent.where({ published: false })
    .select("id", "title", "details", "startsAt", "endsAt")
    .orderBy((event) => event.startsAt.asc())
    .all();
}
