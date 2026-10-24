import "server-only";
import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "sub",
  "sup",
  "ruby",
  "rt",
  "rp",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "blockquote",
  "br",
  "hr",
  "code",
  "pre",
];

export type Chapter = { id: string; title: string; level: number };

export function renderLessonHtml(input: string) {
  const sanitized = sanitizeHtml(input, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["data", "https", "http"] },
    allowedSchemesAppliedToAttributes: ["href", "src"],
    exclusiveFilter: (frame) =>
      frame.tag === "img" &&
      frame.attribs.src?.startsWith("data:") &&
      !/^data:image\/(png|jpeg|gif|webp);base64,/i.test(frame.attribs.src),
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
    },
  });
  const chapters: Chapter[] = [];
  const ids = new Set<string>();
  const html = sanitized.replace(
    /<h([1-6])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (_match, levelText: string, content: string) => {
      const title = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }).trim();
      const base =
        title
          .toLocaleLowerCase()
          .normalize("NFKC")
          .replace(/[^\p{L}\p{N}]+/gu, "-")
          .replace(/^-|-$/g, "") || "chapter";
      let id = base;
      let suffix = 2;
      while (ids.has(id)) id = `${base}-${suffix++}`;
      ids.add(id);
      const level = Number(levelText);
      chapters.push({ id, title, level });
      return `<h${level} id="${id}">${content}</h${level}>`;
    },
  );
  return { html, chapters };
}
