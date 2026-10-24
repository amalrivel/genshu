import { expect, test } from "bun:test";
import { createDemoDocx } from "../scripts/create-demo-docx";
import { convertLessonDocx } from "../src/lib/learn/material-import";

test("Word fixture exercises headings, furigana, tables, images, formatting, and links", async () => {
  const buffer = await createDemoDocx();
  const file = new File([new Uint8Array(buffer)], "demo-lesson.docx", {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const result = await convertLessonDocx(file);
  expect(result.html).toContain("<h1>Demo Word lesson</h1>");
  expect(result.html).toContain("<ruby>日本語<rt>にほんご</rt></ruby>");
  expect(result.html).toContain("<table>");
  expect(result.html).toContain("data:image/png;base64,");
  expect(result.html).toContain("<strong>Teks tebal</strong>");
  expect(result.html).toContain("<em>");
  expect(result.html).toContain('href="https://example.com"');
  expect(result.rubyCount).toBe(1);
});
