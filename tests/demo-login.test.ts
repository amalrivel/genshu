import { expect, test } from "bun:test";
import { isDemoLoginEnabled } from "../src/lib/demo-accounts";

test("demo login is automatic in development and opt-in elsewhere", () => {
  expect(isDemoLoginEnabled("development", undefined)).toBe(true);
  expect(isDemoLoginEnabled("production", undefined)).toBe(false);
  expect(isDemoLoginEnabled("production", "false")).toBe(false);
  expect(isDemoLoginEnabled("production", "TRUE")).toBe(false);
  expect(isDemoLoginEnabled("production", "true")).toBe(true);
  expect(isDemoLoginEnabled(undefined, undefined)).toBe(false);
});
