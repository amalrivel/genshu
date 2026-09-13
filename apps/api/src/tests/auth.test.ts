import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { db } from "../prisma/db.ts";
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

test("authentication boundaries remain public-login/admin-only", async () => {
  await requesters.publicRequest("/auth/register", "POST", {
    email: "public@example.com",
    password: "Test password 123!",
  }, 401);
  await requesters.publicRequest("/auth/login", "POST", {
    email: "unknown@example.com",
    password: "Test password 123!",
  }, 401);

  const participant = await requesters.request("/admin/users", "POST", {
    email: `refactor-participant-${Date.now()}@example.com`,
  }, 201);
  try {
    assert.equal(participant.role, "Participant");
    const response = await fetch("http://localhost:3000/admin/users", {
      headers: { Cookie: context.adminCookie },
    });
    assert.equal(response.status, 200);
  } finally {
    await db.orm.public.User.where({ id: participant.id }).delete();
  }
});
