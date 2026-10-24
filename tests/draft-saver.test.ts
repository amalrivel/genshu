import { describe, expect, test } from "bun:test";
import { createDraftSaver, type SaveStatus } from "../src/lib/activities/draft-saver";
import type { Answers } from "../src/lib/activities/types";

describe("draft saver", () => {
  test("marks edits dirty immediately, keeps false answers, and deduplicates flush", async () => {
    const writes: Answers[] = [];
    const states: SaveStatus[] = [];
    const saver = createDraftSaver(
      async (answers) => {
        writes.push(answers);
      },
      (status) => states.push(status),
    );
    saver.update({ first: false });
    expect(states).toEqual(["unsaved"]);
    await Promise.all([saver.flush(), saver.flush()]);
    expect(writes).toEqual([{ first: false }]);
    expect(states.at(-1)).toBe("saved");
    saver.dispose();
  });
  test("serializes newer edits and never reports an old response as saved", async () => {
    let finish!: () => void;
    const writes: Answers[] = [];
    const states: SaveStatus[] = [];
    const saver = createDraftSaver(
      async (answers) => {
        writes.push(answers);
        if (writes.length === 1)
          await new Promise<void>((resolve) => {
            finish = resolve;
          });
      },
      (status) => states.push(status),
    );
    saver.update({ q: true });
    const first = saver.flush();
    await Promise.resolve();
    await Promise.resolve();
    saver.update({ q: false });
    const second = saver.flush();
    expect(writes).toEqual([{ q: true }]);
    finish();
    await first;
    expect(states).not.toContain("saved");
    await second;
    expect(writes).toEqual([{ q: true }, { q: false }]);
    expect(states.at(-1)).toBe("saved");
    saver.dispose();
  });
  test("a failed save can be retried with the same answers", async () => {
    let calls = 0;
    const states: SaveStatus[] = [];
    const saver = createDraftSaver(
      async () => {
        if (++calls === 1) throw new Error("offline");
      },
      (status) => states.push(status),
    );
    saver.update({ q: false });
    await expect(saver.flush()).rejects.toThrow("offline");
    expect(states.at(-1)).toBe("error");
    await saver.flush();
    expect(states.at(-1)).toBe("saved");
    expect(calls).toBe(2);
    saver.dispose();
  });
});
