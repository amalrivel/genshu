import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  closeTestContext,
  createRequesters,
  createTestContext,
  type TestContext,
} from "./test-helpers.ts";

let context: TestContext;
let requesters: ReturnType<typeof createRequesters>;

before(async () => {
  context = await createTestContext();
  requesters = createRequesters(context);
});
after(() => closeTestContext(context));
const raw = (path: string, init?: RequestInit) => requesters.raw(path, init);
const request = (path: string, method?: string, body?: unknown, status?: number) =>
  requesters.request(path, method, body, status);

test("participant practice payload hides answers and scores final submissions", async () => {
  const topics: number[] = [];
  const questions: number[] = [];
  const practiceSets: number[] = [];
  const title = `Participant practice ${Date.now()}`;
  try {
    const topic = await request("/topics", "POST", { title }, 201);
    topics.push(topic.id);
    const first = await request("/questions", "POST", {
      japaneseText: "日本では左側を走る。",
      indonesianTranslation: "Di Jepang, berkendara di sisi kiri.",
      furigana: "にほんではひだりがわをはしる。",
      correctAnswer: true,
      japaneseExplanation: "日本では左側通行です。",
      indonesianExplanation: "Di Jepang kendaraan berjalan di sisi kiri.",
      topicId: topic.id,
    }, 201);
    const outside = await request("/questions", "POST", {
      japaneseText: "これは別の問題です。",
      indonesianTranslation: "Ini pertanyaan lain.",
      correctAnswer: false,
      japaneseExplanation: "別の問題です。",
      indonesianExplanation: "Pertanyaan lain.",
      topicId: topic.id,
    }, 201);
    const second = await request("/questions", "POST", {
      japaneseText: "赤信号では止まる。",
      indonesianTranslation: "Berhenti saat lampu merah.",
      correctAnswer: true,
      japaneseExplanation: "赤信号では停止します。",
      indonesianExplanation: "Lampu merah mengharuskan berhenti.",
      topicId: topic.id,
    }, 201);
    questions.push(first.id, outside.id, second.id);
    const practiceSet = await request("/practice-sets", "POST", { title, questionIds: [first.id, second.id] }, 201);
    practiceSets.push(practiceSet.id);

    const practice = await request(`/practice-sets/${practiceSet.id}/practice`);
    assert.equal(practice.questions.length, 2);
    assert.deepEqual(practice.questions[0], {
      id: first.id,
      japaneseText: first.japaneseText,
      indonesianTranslation: first.indonesianTranslation,
      furigana: first.furigana,
      position: 0,
    });
    assert.equal(JSON.stringify(practice).includes("correctAnswer"), false);
    assert.equal(JSON.stringify(practice).includes("japaneseExplanation"), false);
    assert.equal(JSON.stringify(practice).includes("indonesianExplanation"), false);

    const submitted = await request(`/practice-sets/${practiceSet.id}/submit`, "POST", {
      answers: [{ questionId: first.id, answer: true }],
    });
    assert.deepEqual(submitted, {
      total: 2,
      correct: 1,
      incorrect: 1,
      unanswered: 1,
      answers: [
        {
          questionId: first.id,
          answer: true,
          isCorrect: true,
          correctAnswer: true,
          japaneseExplanation: first.japaneseExplanation,
          indonesianExplanation: first.indonesianExplanation,
        },
        {
          questionId: second.id,
          answer: null,
          isCorrect: false,
          correctAnswer: true,
          japaneseExplanation: second.japaneseExplanation,
          indonesianExplanation: second.indonesianExplanation,
        },
      ],
    });
    const incorrect = await request(`/practice-sets/${practiceSet.id}/submit`, "POST", {
      answers: [
        { questionId: first.id, answer: true },
        { questionId: second.id, answer: false },
      ],
    });
    assert.equal(incorrect.correct, 1);
    assert.equal(incorrect.incorrect, 1);
    assert.equal(incorrect.unanswered, 0);
    await request(`/practice-sets/${practiceSet.id}/submit`, "POST", {}, 400);
    await request(`/practice-sets/${practiceSet.id}/submit`, "POST", {
      answers: [
        { questionId: first.id, answer: true },
        { questionId: first.id, answer: false },
      ],
    }, 400);
    await request(`/practice-sets/${practiceSet.id}/submit`, "POST", {
      answers: [{ questionId: outside.id, answer: false }],
    }, 400);
    await request("/practice-sets/abc/practice", "GET", undefined, 400);
    await request(`/practice-sets/${practiceSet.id}/submit`, "POST", {
      answers: [{ questionId: "abc", answer: true }],
    }, 400);
    await request("/practice-sets/2147483647/practice", "GET", undefined, 404);
    await request("/practice-sets/2147483647/submit", "POST", { answers: [] }, 404);
  } finally {
    for (const id of practiceSets) await raw(`/practice-sets/${id}`, { method: "DELETE" });
    for (const id of questions) await raw(`/questions/${id}`, { method: "DELETE" });
    for (const id of topics) await raw(`/topics/${id}`, { method: "DELETE" });
  }
});
