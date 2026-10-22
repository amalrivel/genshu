import "server-only";
import { db } from "@/prisma/db";

export async function getTopics() {
  return db.orm.public.Topic.where({ published: true })
    .select("id", "title", "description")
    .orderBy((topic) => topic.title.asc())
    .all();
}

export async function getTopic(topicId: string) {
  return db.orm.public.Topic.where({ id: topicId, published: true })
    .select("id", "title", "description")
    .first();
}

export async function getSubjectsByTopic(topicId: string) {
  const topic = await getTopic(topicId);
  if (!topic) return [];
  const subjects = await db.orm.public.Subject.where({ topicId, published: true })
    .select("id", "topicId", "title", "description")
    .include("material", (material) => material.select("id", "published"))
    .orderBy((subject) => subject.title.asc())
    .all();
  return subjects.filter(({ material }) => material?.published).map(({ id, topicId, title, description }) => ({ id, topicId, title, description }));
}

export async function getMaterial(topicId: string, subjectId: string) {
  const subject = await db.orm.public.Subject.where({ id: subjectId, topicId, published: true })
    .select("id", "title", "description")
    .include("topic", (topic) => topic.select("id", "title", "published"))
    .first();
  if (!subject?.topic?.published) return null;
  const material = await db.orm.public.Material.where({ subjectId, published: true })
    .select("id", "title", "description", "contentHtml")
    .first();
  return material ? { ...material, topic: subject.topic, subject } : null;
}
