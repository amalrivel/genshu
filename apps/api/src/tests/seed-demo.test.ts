import assert from "node:assert/strict";
import { after, test } from "node:test";
import { db } from "../prisma/db.ts";
import { demoPracticeSetTitle, demoQuestions, demoTopics, seedDemo } from "../scripts/seed-demo.ts";

after(() => db.close());

test("demo seed is idempotent and assembles its practice set", async () => {
  const first = await seedDemo();
  const second = await seedDemo();
  assert.deepEqual(second.topics.map((topic) => topic.id), first.topics.map((topic) => topic.id));
  assert.deepEqual(second.questions.map((question) => question.id), first.questions.map((question) => question.id));
  assert.equal(first.topics.length, demoTopics.length);
  assert.equal(first.questions.length, demoQuestions.length);
  assert.equal(second.practiceSet.id, first.practiceSet.id);
  assert.equal((await db.orm.public.PracticeSet.where({ title: demoPracticeSetTitle }).all()).length, 1);
  const links = await db.orm.public.PracticeSetQuestion.where({ practiceSetId: first.practiceSet.id }).all();
  assert.equal(links.length, demoQuestions.length);
});
