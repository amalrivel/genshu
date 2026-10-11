import { db } from "../src/prisma/db";
import { activityTypes } from "../src/lib/activities/activity-types";

try {
  const practice = activityTypes.find((category) => category.id === "practice")!;
  await db.transaction(async (tx) => {
    if (!(await tx.orm.public.ActivityCategory.where({ id: practice.id }).first())) {
      await tx.orm.public.ActivityCategory.create(practice);
    }
  });
  console.log("Practice category ready; existing data preserved.");
} finally {
  await db.close();
}
