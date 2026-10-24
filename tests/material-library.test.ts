import { expect, test } from "bun:test";

test("published material stays discoverable with its learning destination and parent publication state", () => {
  const root = new URL("..", import.meta.url).pathname;
  // Client components need React's client exports, separate from the server test suite.
  const result = Bun.spawnSync(
    [
      process.execPath,
      "--eval",
      `
    import { mock } from "bun:test";
    import { createElement } from "react";
    import { renderToStaticMarkup } from "react-dom/server";
    import { NextIntlClientProvider } from "next-intl";
    import messages from "./messages/id.json";
    const renderWithLocale = element => renderToStaticMarkup(createElement(NextIntlClientProvider, {locale:"id", messages, timeZone:"Asia/Tokyo"}, element));

    mock.module(${JSON.stringify(`${root}src/lib/admin/actions.ts`)}, () => ({
      importMaterial: async () => {}, previewMaterialDraft: async () => {}, publishMaterialDraft: async () => {}, saveMaterialDraft: async () => {}, deleteMaterial: async () => {},
    }));
    const { MaterialImportForm } = await import(${JSON.stringify(`${root}src/components/admin/material-import-form.tsx`)});
    const subject = { id: "subject-one", title: "Sapaan", published: true, topic: { id: "topic-one", title: "Dasar", published: true } };
    const material = { id: "material-one", title: "Pelajaran pertama", description: "Materi terbit", published: true, updatedAt: "2026-10-15", subject };
    const render = (materials, status = "published", drafts = []) => renderWithLocale(createElement(MaterialImportForm, { subjects: [], drafts, materials, status }));
    console.log(JSON.stringify({
      published: render([material]),
      hidden: render([{ ...material, subject: { ...subject, topic: { ...subject.topic, published: false } } }]),
      drafts: render([], "draft"),
      draftRecord: render([], "draft", [{ ...material, subject: { ...subject, material: { published: true } } }]),
    }));
  `,
    ],
    { cwd: root },
  );
  expect(result.exitCode).toBe(0);
  expect(result.stderr.toString()).toBe("");
  const html = JSON.parse(result.stdout.toString());
  expect(html.published).toContain("Pelajaran pertama");
  expect(html.published).toContain('href="/learn/topic-one/subject-one"');
  expect(html.published).toContain("Dasar");
  expect(html.published).toContain("Sapaan");
  expect(html.published).toContain("Tambah materi");
  expect(html.published).toContain("Hapus Pelajaran pertama");
  expect(html.published).toContain("Ubah");
  expect(html.hidden).toContain("Terbit · lokasi masih draft");
  expect(html.hidden).toContain("Kelola topik Dasar");
  expect(html.hidden).not.toContain('href="/learn/topic-one/subject-one"');
  expect(html.drafts).toContain("Tidak ada draft materi");
  expect(html.drafts).toContain(
    "Materi yang sudah diterbitkan tersedia pada pilihan Materi terbit",
  );
  expect(html.draftRecord).toContain("Tinjau draft");
  expect(html.draftRecord).toContain("Hapus Pelajaran pertama");
  expect(html.draftRecord).toContain("Ubah");
});
