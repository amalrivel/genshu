import { fail } from "./errors.ts";

export function object(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body))
    fail(400, "A JSON object is required.");
  return body as Record<string, unknown>;
}

export function positiveId(value: unknown): number {
  const number =
    typeof value === "string" && /^[1-9]\d*$/.test(value)
      ? Number(value)
      : value;
  if (
    typeof number !== "number" ||
    !Number.isInteger(number) ||
    number < 1 ||
    number > 2147483647
  )
    fail(400, "ID must be a positive PostgreSQL integer.");
  return number;
}

export function requiredText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim() || value.includes("\0"))
    fail(400, `${label} is required and must be text without null characters.`);
  return value.trim();
}

export function nonEmptyText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim() || value.includes("\0"))
    fail(400, `${label} is required and must be text without null characters.`);
  return value;
}

export function optionalText(
  value: unknown,
  label: string,
  allowUndefined = true,
) {
  if (
    allowUndefined &&
    (value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim()))
  )
    return value === undefined ? undefined : null;
  return requiredText(value, label);
}

export function email(value: unknown) {
  if (typeof value !== "string") fail(400, "A valid email address is required.");
  const normalized = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.includes("\0"))
    fail(400, "A valid email address is required.");
  return normalized;
}

export function name(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !value.trim() || value.includes("\0"))
    fail(400, "Name must be text without null characters.");
  return value.trim();
}

export function password(value: unknown) {
  if (
    typeof value !== "string" ||
    value.length < 12 ||
    value.length > 1024 ||
    value.includes("\0")
  )
    fail(400, "Password must be 12 to 1024 characters without null characters.");
  return value;
}
