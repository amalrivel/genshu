import { renderLessonHtml } from "@/lib/learn/render";

export function MaterialContent({ html }: { html: string }) {
  const rendered = renderLessonHtml(html);
  return <article className="reading-content rounded-xl border bg-card px-5 py-6 sm:px-9 sm:py-9" dangerouslySetInnerHTML={{ __html: rendered.html }} />;
}
