import { db } from "../../prisma/db.ts";
import { fail } from "../../shared/errors.ts";
import { object, positiveId, requiredText } from "../../shared/validation.ts";

export function practiceSetFields(body: unknown) {
  const data = object(body);
  const description = data.description;
  if (
    description !== undefined &&
    description !== null &&
    (typeof description !== "string" || description.includes("\0"))
  )
    fail(400, "Description must be text without null characters.");
  return {
    title: requiredText(data.title, "Title"),
    description:
      typeof description === "string" && description.trim()
        ? description.trim()
        : null,
    questionIds: questionIds(data.questionIds),
  };
}

export function questionIds(value: unknown, required = false) {
  if (value === undefined && !required) return undefined;
  if (!Array.isArray(value))
    fail(400, "Question IDs must be an array of unique positive PostgreSQL integers.");
  const ids = value.map(positiveId);
  if (new Set(ids).size !== ids.length)
    fail(400, "Question IDs must not contain duplicates.");
  return ids;
}

export async function validateQuestionIds(ids: number[]) {
  if (!ids.length) return;
  const questions = await db.orm.public.Question.where((question) => question.id.in(ids)).all();
  if (questions.length !== ids.length) fail(400, "One or more selected questions do not exist.");
}

export async function practiceSetDetail(practiceSet: { id: number }) {
  const links = await db.orm.public.PracticeSetQuestion.where({ practiceSetId: practiceSet.id })
    .orderBy([(link) => link.position.asc(), (link) => link.id.asc()])
    .all();
  const questions = links.length
    ? await db.orm.public.Question.where((question) => question.id.in(links.map((link) => link.questionId))).all()
    : [];
  const byId = new Map(questions.map((question) => [question.id, question]));
  return {
    ...practiceSet,
    questions: links.map((link) => ({ ...byId.get(link.questionId)!, position: link.position })),
  };
}

export async function replaceQuestions(practiceSetId: number, selected: number[]) {
  return db.transaction(async (tx) => {
    const set = await tx.orm.public.PracticeSet.where({ id: practiceSetId }).first();
    if (!set) return null;
    await tx.execute(
      tx.sql.public.practiceSetQuestion
        .delete()
        .where((link, fns) => fns.eq(link.practiceSetId, practiceSetId))
        .build(),
    );
    for (const [position, questionId] of selected.entries())
      await tx.orm.public.PracticeSetQuestion.create({ practiceSetId, questionId, position });
    return set;
  });
}
