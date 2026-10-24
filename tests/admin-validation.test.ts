import { describe, expect, test } from "bun:test";
import {
  actionFailure,
  formResult,
  FormValidationError,
  parsePracticeQuestions,
} from "../src/lib/admin/validation";
import { managementParams } from "../src/lib/admin/types";

describe("management form contracts", () => {
  test("structured questions preserve false keys, order, separators, and trim text", () => {
    expect(
      parsePracticeQuestions(
        JSON.stringify([
          { question: " A|B\nC ", correctAnswer: false },
          { question: "D", correctAnswer: true },
        ]),
      ),
    ).toEqual([
      { question: "A|B\nC", correctAnswer: false },
      { question: "D", correctAnswer: true },
    ]);
  });
  test("rejects missing, malformed, empty, oversized, or unkeyed questions", () => {
    for (const value of [
      null,
      "true|old format",
      "{}",
      "[]",
      JSON.stringify([{ question: "", correctAnswer: true }]),
      JSON.stringify([{ question: "a", correctAnswer: "false" }]),
      JSON.stringify([{ question: "a", correctAnswer: null }]),
      JSON.stringify([{ question: "a".repeat(1001), correctAnswer: false }]),
      " ".repeat(20001),
    ])
      expect(() => parsePracticeQuestions(value)).toThrow(FormValidationError);
  });
  test("returns field errors and hides unexpected database details", async () => {
    expect(
      actionFailure(new FormValidationError("Waktu selesai harus setelah mulai.", "endsAt")),
    ).toMatchObject({
      success: false,
      fieldErrors: { endsAt: "Waktu selesai harus setelah mulai." },
    });
    expect(
      JSON.stringify(actionFailure(new Error("postgres://private:secret@host"))),
    ).not.toContain("secret");
    expect(
      actionFailure({ body: { code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" } }),
    ).toMatchObject({
      success: false,
      fieldErrors: { email: "Gunakan email lain untuk akun baru." },
    });
    expect(actionFailure(new FormValidationError("Konten sudah tidak tersedia."))).toMatchObject({
      success: false,
      message: "Konten sudah tidak tersedia.",
    });
    expect(await formResult(async () => undefined)).toMatchObject({ success: true });
    expect(
      await formResult(async () => {
        throw new FormValidationError("Tidak valid", "title");
      }),
    ).toMatchObject({ success: false, fieldErrors: { title: "Tidak valid" } });
  });
  test("validates sections, hostile query shapes, pagination and search bounds", () => {
    expect(managementParams({})).toMatchObject({ section: "practice" });
    for (const section of ["materials", "topics", "subjects", "events"])
      expect(managementParams({ section })).toMatchObject({ section });
    expect(managementParams({ section: "__proto__", page: "-2", q: ["unexpected"] })).toEqual({
      section: "practice",
      page: 1,
      status: "published",
      q: "",
    });
    expect(managementParams({ section: "practice", page: "2", q: "  teks  " })).toEqual({
      section: "practice",
      page: 2,
      status: "published",
      q: "teks",
    });
    expect(managementParams({ section: "materials", status: "draft" })).toMatchObject({
      status: "draft",
    });
    expect(managementParams({ status: ["draft"] })).toMatchObject({ status: "published" });
    expect(managementParams({ page: "99999999999", q: "x".repeat(200) })).toMatchObject({
      page: 10000,
      q: "x".repeat(120),
    });
  });
});
