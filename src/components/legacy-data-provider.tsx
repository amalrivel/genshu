"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DataProvider } from "@/lib/data-context";

export function LegacyDataProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublishedLearning =
    pathname === "/materials" ||
    pathname.startsWith("/materials/") ||
    pathname === "/practice" ||
    pathname.startsWith("/practice/");
  return isPublishedLearning ? (
    children
  ) : (
    /*
      REVIEW: saya mengerti anda membuat hanya routes tertentu dan anak nya berhak menggunakan isi dari DataProvider.
      tapi ini masih agak kurang nyaman dalam proses maintenance, mengapa juga namanya legacy wkwk.
    */
    <DataProvider>{children}</DataProvider>
  );
}
