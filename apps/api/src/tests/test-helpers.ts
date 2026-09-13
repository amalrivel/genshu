import assert from "node:assert/strict";
import { hashPassword } from "../modules/auth/auth.service.ts";
import { db } from "../prisma/db.ts";

export const base = "http://localhost:3000";

export type TestContext = {
  adminId: number;
  adminCookie: string;
};

export async function createTestContext(): Promise<TestContext> {
  const user = await db.orm.public.User.create({
    email: `admin-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    name: "Test Admin",
    role: "Admin",
    isActive: true,
    passwordHash: await hashPassword("Test password 123!"),
  });
  const response = await fetch(base + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email, password: "Test password 123!" }),
  });
  assert.equal(response.status, 200);
  return {
    adminId: user.id,
    adminCookie: response.headers.getSetCookie()[0]!.split(";")[0]!,
  };
}

export async function closeTestContext(context: TestContext) {
  await db.orm.public.User.where({ id: context.adminId }).delete();
  await db.close();
}

export function createRequesters(context: TestContext) {
  async function raw(path: string, init: RequestInit = {}) {
    return fetch(base + path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Cookie: context.adminCookie,
        ...init.headers,
      },
    });
  }
  async function request(path: string, method = "GET", body?: unknown, status = 200) {
    const response = await raw(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = response.status === 204 ? null : await response.json();
    assert.equal(response.status, status, JSON.stringify(data));
    return data;
  }
  async function publicRequest(path: string, method = "GET", body?: unknown, status = 200) {
    const response = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = response.status === 204 ? null : await response.json();
    assert.equal(response.status, status, JSON.stringify(data));
    return { data, response };
  }
  return { raw, request, publicRequest };
}
