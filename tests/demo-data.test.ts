import { describe, expect, test } from "bun:test";
import { assertDemoDatabase, createDemoData, demoUsers } from "../scripts/demo-data";

describe("demo seed fixtures", () => {
  const now = new Date("2026-10-11T00:00:00Z");
  const data = createDemoData(now);

  test("relationships are valid and the fresh student has no attempts", () => {
    const topics = new Set(data.topics.map((row) => row.id));
    const subjects = new Set(data.subjects.map((row) => row.id));
    const activities = new Set(data.activities.map((row) => row.id));
    const users = new Set(demoUsers.map((row) => row.id));
    for (const row of data.subjects) expect(topics.has(row.topicId)).toBe(true);
    for (const row of [...data.materials, ...data.materialDrafts])
      expect(subjects.has(row.subjectId)).toBe(true);
    for (const row of data.questions) expect(activities.has(row.activityId)).toBe(true);
    for (const row of data.attempts) {
      expect(activities.has(row.activityId)).toBe(true);
      expect(users.has(row.userId)).toBe(true);
      expect(
        row.questionsSnapshot.every((question) => question.activityId === row.activityId),
      ).toBe(true);
    }
    expect(data.attempts.some((row) => row.userId === "demo-user-new-student")).toBe(false);
  });

  test("saved results include correct, incorrect, unanswered, and draft cases", () => {
    const result = (id: string) => data.attempts.find((row) => row.id === id)!.result!;
    expect(result("demo-attempt-perfect").score).toBe(100);
    expect(result("demo-attempt-mixed")).toMatchObject({
      score: 40,
      correct: 2,
      incorrect: 2,
      unanswered: 1,
      total: 5,
    });
    expect(result("demo-attempt-incorrect").score).toBe(0);
    const draft = data.attempts.find((row) => row.id === "demo-attempt-draft")!;
    expect(draft.status).toBe("in_progress");
    expect(draft.result).toBeNull();
    expect(draft.answers["demo-question-2"]).toBe(false);
  });

  test("calendar includes upcoming, ongoing, past, and unpublished events", () => {
    for (const event of data.events)
      expect(Date.parse(event.endsAt)).toBeGreaterThan(Date.parse(event.startsAt));
    expect(
      data.events.some((event) => event.published && Date.parse(event.startsAt) > now.getTime()),
    ).toBe(true);
    expect(
      data.events.some(
        (event) =>
          event.published &&
          Date.parse(event.startsAt) < now.getTime() &&
          Date.parse(event.endsAt) > now.getTime(),
      ),
    ).toBe(true);
    expect(data.events.some((event) => Date.parse(event.endsAt) < now.getTime())).toBe(true);
    expect(data.events.some((event) => !event.published)).toBe(true);
    expect(data.materials[0].contentHtml).toContain("<ruby>");
    expect(data.materials[0].contentHtml).toContain("<table>");
  });

  test("seed refuses production, missing URLs, and remote targets", () => {
    expect(() => assertDemoDatabase(undefined, undefined)).toThrow();
    expect(() => assertDemoDatabase("postgres://localhost/demo", "production")).toThrow();
    expect(() => assertDemoDatabase("postgres://remote.example/demo", "development")).toThrow();
    expect(() => assertDemoDatabase("https://localhost/demo", "development")).toThrow();
    expect(assertDemoDatabase("postgres://127.0.0.1:5433/demo", undefined).pathname).toBe("/demo");
  });
});
