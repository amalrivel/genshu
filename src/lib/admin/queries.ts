import "server-only";
import { or } from "@prisma/orm-postgres/orm-client";
import { db } from "@/prisma/db";
import { requireAdmin, requireManagement } from "@/lib/auth-session";
import type { ManagementContent, ManagementSection, MaterialStatus } from "./types";

export async function getManagementContent(
  section: ManagementSection,
  search = "",
  page = 1,
  status: MaterialStatus = "published",
): Promise<ManagementContent> {
  await requireManagement();
  const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
  const offset = (page - 1) * 20;
  const content: ManagementContent = {
    hasNext: false,
    topics: [],
    subjects: [],
    topicOptions: [],
    subjectOptions: [],
    materialDrafts: [],
    materials: [],
    activities: [],
    announcements: [],
    recordings: [],
    events: [],
    accounts: [],
  };
  switch (section) {
    case "topics": {
      const rows = await db.orm.public.Topic.where((row) => row.title.ilike(pattern))
        .select("id", "title", "description", "published")
        .orderBy([(row) => row.title.asc(), (row) => row.id.asc()])
        .offset(offset)
        .limit(21)
        .all();
      content.topics = rows.slice(0, 20);
      content.hasNext = rows.length > 20;
      break;
    }
    case "subjects": {
      const [rows, topics] = await Promise.all([
        db.orm.public.Subject.where((row) => row.title.ilike(pattern))
          .select("id", "title", "description", "published", "topicId")
          .include("topic", (topic) => topic.select("title"))
          .orderBy([(row) => row.title.asc(), (row) => row.id.asc()])
          .offset(offset)
          .limit(21)
          .all(),
        db.orm.public.Topic.select("id", "title")
          .orderBy((row) => row.title.asc())
          .all(),
      ]);
      content.subjects = rows.slice(0, 20);
      content.topicOptions = topics;
      content.hasNext = rows.length > 20;
      break;
    }
    case "materials": {
      const subjects = db.orm.public.Subject.select("id", "title", "published")
        .include("topic", (topic) => topic.select("id", "title", "published"))
        .include("material", (material) => material.select("published"))
        .orderBy((row) => row.title.asc())
        .all();
      if (status === "draft") {
        const [rows, options] = await Promise.all([
          db.orm.public.MaterialDraft.where((row) => row.title.ilike(pattern))
            .select("id", "title", "description")
            .include("subject", (subject) =>
              subject
                .select("id", "title", "published")
                .include("topic", (topic) => topic.select("id", "title", "published"))
                .include("material", (material) => material.select("published")),
            )
            .orderBy([(row) => row.updatedAt.desc(), (row) => row.id.asc()])
            .offset(offset)
            .limit(21)
            .all(),
          subjects,
        ]);
        content.materialDrafts = rows.slice(0, 20);
        content.hasNext = rows.length > 20;
        content.subjectOptions = options.map(({ material, ...subject }) => ({
          ...subject,
          replacesPublished: !!material?.published,
        }));
      } else {
        const [rows, options] = await Promise.all([
          db.orm.public.Material.where({ published: true })
            .where((row) => row.title.ilike(pattern))
            .select("id", "title", "description", "published", "updatedAt")
            .include("subject", (subject) =>
              subject
                .select("id", "title", "published")
                .include("topic", (topic) => topic.select("id", "title", "published")),
            )
            .orderBy([(row) => row.updatedAt.desc(), (row) => row.id.asc()])
            .offset(offset)
            .limit(21)
            .all(),
          subjects,
        ]);
        content.materials = rows.slice(0, 20);
        content.hasNext = rows.length > 20;
        content.subjectOptions = options.map(({ material, ...subject }) => ({
          ...subject,
          replacesPublished: !!material?.published,
        }));
      }
      break;
    }
    case "practice": {
      const rows = await db.orm.public.Activity.where({ type: "practice" })
        .where((row) => row.title.ilike(pattern))
        .select("id", "title", "description", "published")
        .include("questions", (questions) =>
          questions
            .select("question", "correctAnswer", "position")
            .orderBy((question) => question.position.asc()),
        )
        .orderBy([(row) => row.title.asc(), (row) => row.id.asc()])
        .offset(offset)
        .limit(21)
        .all();
      content.activities = rows.slice(0, 20);
      content.hasNext = rows.length > 20;
      break;
    }
    case "announcements": {
      const rows = await db.orm.public.Announcement.where((row) => row.title.ilike(pattern))
        .select("id", "title", "summary", "content", "published")
        .orderBy([(row) => row.updatedAt.desc(), (row) => row.id.asc()])
        .offset(offset)
        .limit(21)
        .all();
      content.announcements = rows.slice(0, 20);
      content.hasNext = rows.length > 20;
      break;
    }
    case "recordings": {
      const rows = await db.orm.public.Recording.where((row) => row.title.ilike(pattern))
        .select("id", "title", "description", "lessonDate", "url", "published")
        .orderBy([(row) => row.updatedAt.desc(), (row) => row.id.asc()])
        .offset(offset)
        .limit(21)
        .all();
      content.recordings = rows.slice(0, 20);
      content.hasNext = rows.length > 20;
      break;
    }
    case "events": {
      const rows = await db.orm.public.CalendarEvent.where((row) => row.title.ilike(pattern))
        .select("id", "title", "details", "startsAt", "endsAt", "published")
        .orderBy([(row) => row.updatedAt.desc(), (row) => row.id.asc()])
        .offset(offset)
        .limit(21)
        .all();
      content.events = rows.slice(0, 20);
      content.hasNext = rows.length > 20;
      break;
    }
    case "accounts": {
      await requireAdmin();
      const rows = await db.orm.public.GenshuUser.where((row) =>
        or(row.name.ilike(pattern), row.email.ilike(pattern)),
      )
        .select("id", "name", "email", "role")
        .orderBy([(row) => row.name.asc(), (row) => row.id.asc()])
        .offset(offset)
        .limit(21)
        .all();
      content.accounts = rows.slice(0, 20);
      content.hasNext = rows.length > 20;
      break;
    }
  }
  return content;
}
