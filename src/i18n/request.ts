import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, localeCookie } from "./config";

export default getRequestConfig(async () => {
  const preferred = (await cookies()).get(localeCookie)?.value;
  const locale = isLocale(preferred) ? preferred : defaultLocale;
  return {
    locale,
    timeZone: "Asia/Tokyo",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
