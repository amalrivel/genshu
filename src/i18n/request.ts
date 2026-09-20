import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export const locales = ["id", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "id";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

  let locale: Locale = defaultLocale;
  if (cookieLocale && (cookieLocale === "id" || cookieLocale === "ja")) {
    locale = cookieLocale as Locale;
  } else {
    // First visit: browser detection
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language") || "";
    if (acceptLanguage.toLowerCase().includes("ja")) {
      locale = "ja";
    } else {
      locale = "id";
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
