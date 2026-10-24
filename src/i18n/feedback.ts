import { feedbackKeys } from "./feedback-keys";

type Translator = (key: string, values?: Record<string, string | number>) => string;

// shortcut: legacy action text maps to keys here; use message codes when action contracts change.
export function translateFeedback(t: Translator, message: string): string {
  const key = Object.hasOwn(feedbackKeys, message) ? feedbackKeys[message] : undefined;
  if (key) return t(key);
  const required = /^Isian wajib diisi dan maksimal (\d+) karakter\.$/.exec(message);
  if (required) return t("requiredMaximum", { maximum: Number(required[1]) });
  const maximum = /^Maksimal (\d+) karakter\.$/.exec(message);
  if (maximum) return t("maximum", { maximum: Number(maximum[1]) });
  const question =
    /^Lengkapi pertanyaan dan kunci jawaban soal (\d+) \(maksimal 1\.000 karakter\)\.$/.exec(
      message,
    );
  if (question) return t("questionRequired", { number: Number(question[1]) });
  return message;
}
