import "server-only";
import { db } from "@/prisma/db";
import { requireAdmin, requireManagement } from "@/lib/auth-session";
import { renderLessonHtml } from "@/lib/learn/render";

export async function getManagedAccounts() {
  await requireAdmin();
  return db.orm.public.GenshuUser.select("id", "name", "email", "role")
    .orderBy((user) => user.name.asc())
    .all();
}

export async function getManagementContent() {
  await requireManagement();
  const [topics, subjects, materialDrafts, announcements, recordings, events, activities] = await Promise.all([
    db.orm.public.Topic.select("id", "title", "description", "published").orderBy((row) => row.title.asc()).all(),
    db.orm.public.Subject.select("id", "topicId", "title", "description", "published")
      .include("topic", (topic) => topic.select("title"))
      .orderBy((row) => row.title.asc()).all(),
    db.orm.public.MaterialDraft.select("id", "subjectId", "title", "description", "contentHtml", "warnings", "updatedAt")
      .include("subject", (subject) => subject.select("title"))
      .orderBy((row) => row.updatedAt.desc()).all(),
    db.orm.public.Announcement.select("id", "title", "summary", "published", "content")
      .orderBy((row) => row.updatedAt.desc()).limit(100).all(),
    db.orm.public.Recording.select("id", "title", "description", "lessonDate", "url", "published")
      .orderBy((row) => row.updatedAt.desc()).limit(100).all(),
    db.orm.public.CalendarEvent.select("id", "title", "details", "startsAt", "endsAt", "published")
      .orderBy((row) => row.updatedAt.desc()).limit(100).all(),
    db.orm.public.Activity.where({ type: "practice" }).select("id", "title", "description", "published")
      .include("questions", (questions) => questions.select("id", "question", "correctAnswer", "position").orderBy((question) => question.position.asc()))
      .orderBy((row) => row.title.asc()).all(),
  ]);
  return {
    topics,
    subjects,
    materialDrafts: materialDrafts.map((draft) => ({ ...draft, contentHtml: renderLessonHtml(draft.contentHtml).html })),
    announcements,
    recordings,
    events,
    activities,
  };
}
