import { useTranslations } from "next-intl";
import Link from "next/link";
import type { Chapter } from "@/lib/learn/render";

export function ChapterNavigation({ chapters }: { chapters: Chapter[] }) {
  const t = useTranslations("UI");

  if (!chapters.length) return null;
  const chapterLinks = (
    <ol className="flex flex-col gap-2">
      {chapters.map((chapter) => (
        <li key={chapter.id} style={{ marginInlineStart: `${(chapter.level - 1) * 0.65}rem` }}>
          <Link
            className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2"
            href={`#${encodeURIComponent(chapter.id)}`}
          >
            {chapter.title}
          </Link>
        </li>
      ))}
    </ol>
  );
  return (
    <aside
      aria-label={t("Navigasi_bab")}
      className="h-fit rounded-lg border bg-card p-4 lg:sticky lg:top-24"
    >
      <details className="lg:hidden">
        <summary className="min-h-10 font-semibold">{t("Daftar_bab")}</summary>
        <nav aria-label={t("Daftar_bab")} className="pt-3">
          {chapterLinks}
        </nav>
      </details>
      <div className="hidden lg:block">
        <h2 className="mb-3 text-base font-semibold">{t("Daftar_bab")}</h2>
        <nav aria-label={t("Daftar_bab")}>{chapterLinks}</nav>
      </div>
    </aside>
  );
}
