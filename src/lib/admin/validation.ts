import type { ActionResult } from "./types";

export class FormValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

export function actionFailure(error: unknown): ActionResult {
  if (error instanceof FormValidationError)
    return error.field
      ? {
          success: false,
          message: "Periksa isian yang ditandai, lalu coba lagi.",
          fieldErrors: { [error.field]: error.message },
        }
      : { success: false, message: error.message };
  if (
    error &&
    typeof error === "object" &&
    "body" in error &&
    error.body &&
    typeof error.body === "object" &&
    "code" in error.body &&
    error.body.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
  ) {
    return {
      success: false,
      message: "Email sudah digunakan.",
      fieldErrors: { email: "Gunakan email lain untuk akun baru." },
    };
  }
  return {
    success: false,
    message: "Perubahan belum berhasil disimpan. Periksa isian dan koneksi Anda, lalu coba lagi.",
  };
}

export async function formResult(save: () => Promise<void>): Promise<ActionResult> {
  try {
    await save();
    return { success: true, message: "Perubahan berhasil disimpan." };
  } catch (error) {
    return actionFailure(error);
  }
}

export function parsePracticeQuestions(input: unknown) {
  if (typeof input !== "string" || input.length > 20000)
    throw new FormValidationError(
      "Soal terlalu panjang. Kurangi jumlah atau panjang soal.",
      "questions",
    );
  let rows: unknown;
  try {
    rows = JSON.parse(input);
  } catch {
    throw new FormValidationError("Format soal tidak valid.", "questions");
  }
  if (!Array.isArray(rows) || !rows.length)
    throw new FormValidationError("Tambahkan minimal satu soal.", "questions");
  return rows.map((row, index): { question: string; correctAnswer: boolean } => {
    if (
      !row ||
      typeof row !== "object" ||
      typeof row.question !== "string" ||
      !row.question.trim() ||
      row.question.trim().length > 1000 ||
      typeof row.correctAnswer !== "boolean"
    ) {
      throw new FormValidationError(
        `Lengkapi pertanyaan dan kunci jawaban soal ${index + 1} (maksimal 1.000 karakter).`,
        "questions",
      );
    }
    return { question: row.question.trim(), correctAnswer: row.correctAnswer };
  });
}
