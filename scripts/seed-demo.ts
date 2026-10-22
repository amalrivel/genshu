import { hashPassword } from "better-auth/crypto";
import { db } from "../src/prisma/db";
import { assertDemoDatabase, createDemoData, demoPassword, demoUsers } from "./demo-data";

try {
  const target = assertDemoDatabase(process.env.DATABASE_URL, process.env.NODE_ENV);
  console.log(`Demo seed: ${target.hostname}:${target.port || "5432"}${target.pathname}`);
  const fixtures = createDemoData();
  const password = await hashPassword(demoPassword);
  const counts = { inserted: 0, preserved: 0 };
  // One transaction keeps account credentials and related demo content consistent.
  await db.transaction(async (tx) => {
    async function insertIfMissing<T>(existing: PromiseLike<T | null>, create: () => PromiseLike<unknown>) {
      if (await existing) counts.preserved++;
      else { await create(); counts.inserted++; }
    }
    for (const user of demoUsers) {
      const existing = await tx.orm.public.GenshuUser.where({ email: user.email }).first();
      if (existing && existing.id !== user.id) throw new Error(`Demo email already belongs to another account: ${user.email}`);
      const byId = await tx.orm.public.GenshuUser.where({ id: user.id }).first();
      if (byId && byId.email !== user.email) throw new Error(`Demo user ID collision: ${user.id}`);
      await insertIfMissing(Promise.resolve(byId), () => tx.orm.public.GenshuUser.create({ ...user, emailVerified: true }));
      const credential = await tx.orm.public.GenshuAccount.where({ userId: user.id, providerId: "credential" }).first();
      await insertIfMissing(Promise.resolve(credential), () => tx.orm.public.GenshuAccount.create({
        id: `demo-credential-${user.id}`, accountId: user.id, providerId: "credential", userId: user.id, password,
      }));
    }
    await insertIfMissing(tx.orm.public.ActivityCategory.where({ id: "practice" }).first(), () => tx.orm.public.ActivityCategory.create({
      id: "practice", title: "Practice", description: "Practice with available question sets.",
    }));
    for (const row of fixtures.topics) await insertIfMissing(tx.orm.public.Topic.where({ id: row.id }).first(), () => tx.orm.public.Topic.create(row));
    for (const row of fixtures.subjects) await insertIfMissing(tx.orm.public.Subject.where({ id: row.id }).first(), () => tx.orm.public.Subject.create(row));
    for (const row of fixtures.materials) {
      const existing = await tx.orm.public.Material.where({ subjectId: row.subjectId }).first();
      await insertIfMissing(Promise.resolve(existing), () => tx.orm.public.Material.create(row));
    }
    for (const row of fixtures.materialDrafts) {
      // A published draft is removed by the app; do not resurrect it on rerun.
      const material = await tx.orm.public.Material.where({ subjectId: row.subjectId }).first();
      if (material?.title === row.title) { counts.preserved++; continue; }
      await insertIfMissing(tx.orm.public.MaterialDraft.where({ id: row.id }).first(), () => tx.orm.public.MaterialDraft.create(row));
    }
    for (const row of fixtures.activities) await insertIfMissing(tx.orm.public.Activity.where({ id: row.id }).first(), () => tx.orm.public.Activity.create(row));
    for (const row of fixtures.questions) {
      // Teacher edits replace question IDs; never append old fixtures to an edited activity.
      const existingQuestions = await tx.orm.public.ActivityQuestion.where({ activityId: row.activityId }).select("id").all();
      if (existingQuestions.some((question) => !fixtures.questions.some((fixture) => fixture.id === question.id))) {
        counts.preserved++; continue;
      }
      await insertIfMissing(tx.orm.public.ActivityQuestion.where({ id: row.id }).first(), () => tx.orm.public.ActivityQuestion.create(row));
    }
    for (const row of fixtures.attempts) await insertIfMissing(tx.orm.public.ActivityAttempt.where({ id: row.id }).first(), () => tx.orm.public.ActivityAttempt.create(row));
    for (const row of fixtures.announcements) await insertIfMissing(tx.orm.public.Announcement.where({ id: row.id }).first(), () => tx.orm.public.Announcement.create(row));
    for (const row of fixtures.recordings) await insertIfMissing(tx.orm.public.Recording.where({ id: row.id }).first(), () => tx.orm.public.Recording.create(row));
    for (const row of fixtures.events) await insertIfMissing(tx.orm.public.CalendarEvent.where({ id: row.id }).first(), () => tx.orm.public.CalendarEvent.create(row));
  });
  console.log(`Done: ${counts.inserted} inserted; ${counts.preserved} existing records preserved.`);
  console.log("Demo accounts: " + demoUsers.map((user) => user.email).join(", "));
  console.log("Initial demo password and behavior checklist: docs/demo-testing.md");
} finally {
  await db.close();
}
