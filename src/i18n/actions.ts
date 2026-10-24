"use server";

import { cookies } from "next/headers";
import { isLocale, localeCookie } from "./config";

export async function setLocale(locale: unknown) {
  if (!isLocale(locale)) throw new Error("Unsupported locale");
  (await cookies()).set(localeCookie, locale, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
}
