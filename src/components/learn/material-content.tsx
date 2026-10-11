import { renderLessonHtml } from "@/lib/learn/render";

export function MaterialContent({ html }: { html: string }) {
  const rendered = renderLessonHtml(html);
  return <article className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: rendered.html }} />;
}
