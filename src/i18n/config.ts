export const locales = ["id", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "id";
export const localeCookie = "genshu-locale";

export function isLocale(value: unknown): value is Locale {
  return value === "id" || value === "ja";
}
