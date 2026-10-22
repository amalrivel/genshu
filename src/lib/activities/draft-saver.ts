import type { Answers } from "./types";

export type SaveStatus = "saved" | "unsaved" | "saving" | "error";

// Serialize writes so an older response cannot overwrite a newer draft.
export function createDraftSaver(save: (answers: Answers) => Promise<unknown>, status: (value: SaveStatus) => void) {
  let latest: Answers | null = null;
  let revision = 0;
  let savedRevision = 0;
  let queuedRevision = -1;
  let queue: Promise<unknown> = Promise.resolve();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let active = true;
  const notify = (value: SaveStatus) => { if (active) status(value); };

  function flush() {
    clearTimeout(timer);
    if (!latest || revision === savedRevision || revision === queuedRevision) return queue;
    const snapshot = latest;
    const version = revision;
    queuedRevision = version;
    notify("saving");
    queue = queue.catch(() => undefined).then(async () => {
      try {
        await save(snapshot);
        savedRevision = version;
        if (revision === version) notify("saved");
      } catch (error) {
        if (revision === version) notify("error");
        throw error;
      } finally {
        if (queuedRevision === version) queuedRevision = -1;
      }
    });
    return queue;
  }

  return {
    update(answers: Answers) {
      latest = { ...answers };
      revision++;
      notify("unsaved");
      clearTimeout(timer);
      timer = setTimeout(() => { void flush().catch(() => undefined); }, 500);
    },
    flush,
    dispose() { active = false; clearTimeout(timer); },
  };
}
