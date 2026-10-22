import "server-only";
import { db } from "@/prisma/db";

export async function getUpcomingEvents(limit = 20) {
  const now = new Date();
  const rows = await db.orm.public.CalendarEvent.where({ published: true })
    .where((event) => event.endsAt.gte(now.toISOString()))
    .select("id", "title", "details", "startsAt", "endsAt")
    .orderBy((event) => event.startsAt.asc())
    .limit(limit)
    .all();
  return rows.map((event) => ({ ...event, ongoing: new Date(event.startsAt).getTime() <= now.getTime() }));
}

export async function getEventDrafts() {
  return db.orm.public.CalendarEvent.where({ published: false })
    .select("id", "title", "details", "startsAt", "endsAt")
    .orderBy((event) => event.startsAt.asc())
    .all();
}
