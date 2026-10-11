import Link from "next/link";
import type { Chapter } from "@/lib/learn/render";

export function ChapterNavigation({ chapters }: { chapters: Chapter[] }) {
  if (!chapters.length) return null;
  return <aside aria-label="Chapter navigation" className="rounded-lg border p-4">
    <h2 className="mb-3 font-semibold">Chapters</h2>
    <nav>
      <ol className="space-y-2">
        {chapters.map((chapter) => <li key={chapter.id} style={{ marginInlineStart: `${(chapter.level - 1) * 0.65}rem` }}>
          <Link className="underline-offset-4 hover:underline focus-visible:outline-2" href={`#${encodeURIComponent(chapter.id)}`}>{chapter.title}</Link>
        </li>)}
      </ol>
    </nav>
  </aside>;
}
