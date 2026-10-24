import "server-only";
import JSZip from "jszip";
import mammoth from "mammoth";
import sanitizeHtml from "sanitize-html";
import yauzl from "yauzl";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_EXPANDED_BYTES = 50 * 1024 * 1024;
const MAX_ENTRIES = 2000;

function preflightZip(buffer: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(
      buffer,
      { lazyEntries: true, validateEntrySizes: true, strictFileNames: true },
      (openError, zip) => {
        if (openError || !zip) return reject(new Error("The document is not a valid Word file"));
        let entries = 0;
        let expanded = 0;
        let actualExpanded = 0;
        let done = false;
        const fail = (error: Error) => {
          if (done) return;
          done = true;
          zip.close();
          reject(error);
        };
        zip.on("error", (error) =>
          fail(new Error("The document archive could not be read: " + error.message)),
        );
        zip.on("end", () => {
          if (done) return;
          done = true;
          resolve();
        });
        zip.on("entry", (entry) => {
          entries += 1;
          expanded += entry.uncompressedSize;
          if (
            entries > MAX_ENTRIES ||
            expanded > MAX_EXPANDED_BYTES ||
            entry.generalPurposeBitFlag & 1 ||
            /(^\/|(^|\/)\.\.(\/|$))/.test(entry.fileName)
          ) {
            return fail(new Error("The document exceeds safe archive limits"));
          }
          zip.openReadStream(entry, (streamError, stream) => {
            if (streamError || !stream)
              return fail(new Error("The document archive could not be read"));
            stream.on("data", (chunk: Buffer) => {
              actualExpanded += chunk.length;
              if (actualExpanded > MAX_EXPANDED_BYTES)
                fail(new Error("The document expands beyond the safe limit"));
            });
            stream.on("error", () => fail(new Error("The document archive could not be read")));
            stream.on("end", () => {
              if (!done) zip.readEntry();
            });
          });
        });
        zip.readEntry();
      },
    );
  });
}

function xmlText(xml: string) {
  return xml
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function addRubySupport(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer, { checkCRC32: true, createFolders: false });
  const document = zip.file("word/document.xml");
  if (!document) throw new Error("The Word document body is missing");
  const xml = await document.async("string");
  const warnings: string[] = [];
  const tokens = new Map<string, string>();
  let rubyCount = 0;
  const transformed = xml.replace(
    /<w:ruby\b[^>]*>([\s\S]*?)<\/w:ruby>/g,
    (whole, contents: string) => {
      rubyCount += 1;
      const base = contents.match(/<w:rubyBase\b[^>]*>([\s\S]*?)<\/w:rubyBase>/)?.[1];
      const reading = contents.match(/<w:rt\b[^>]*>([\s\S]*?)<\/w:rt>/)?.[1];
      const baseText = base ? xmlText(base) : "";
      const readingText = reading ? xmlText(reading) : "";
      if (!baseText || !readingText) {
        warnings.push("A furigana annotation could not be read and needs review.");
        return whole;
      }
      const token = `GENSHU_FURIGANA_${rubyCount}`;
      tokens.set(token, `<ruby>${escapeHtml(baseText)}<rt>${escapeHtml(readingText)}</rt></ruby>`);
      return `<w:r><w:rPr/><w:t>${token}</w:t></w:r>`;
    },
  );
  zip.file("word/document.xml", transformed);
  return {
    buffer: await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 3 },
    }),
    warnings,
    rubyCount,
    tokens,
  };
}

export async function convertLessonDocx(file: File) {
  if (file.size < 4 || file.size > MAX_UPLOAD_BYTES || !file.name.toLowerCase().endsWith(".docx")) {
    throw new Error("Choose a .docx file no larger than 10 MiB");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b)
    throw new Error("The file is not a valid .docx archive");
  await preflightZip(buffer);
  const { buffer: convertedInput, warnings, rubyCount, tokens } = await addRubySupport(buffer);
  const result = await mammoth.convertToHtml(
    { buffer: convertedInput },
    { externalFileAccess: false },
  );
  let html = result.value;
  for (const [token, ruby] of tokens) html = html.replaceAll(token, ruby);
  if (rubyCount && html.includes("GENSHU_FURIGANA_"))
    warnings.push("Some furigana could not be represented in the preview.");
  warnings.push(...result.messages.map(({ message }) => message));
  html = sanitizeHtml(html, {
    allowedTags: [
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
    ],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title", "width", "height"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["data", "https", "http"] },
    exclusiveFilter: (frame) =>
      frame.tag === "img" &&
      frame.attribs.src?.startsWith("data:") &&
      !/^data:image\/(png|jpeg|gif|webp);base64,/i.test(frame.attribs.src),
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true) },
  });
  if (!sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim())
    throw new Error("The document contains no readable lesson content");
  return { html, warnings: [...new Set(warnings)], rubyCount };
}
