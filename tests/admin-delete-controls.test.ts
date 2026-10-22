import { expect, test } from "bun:test";

test("every content section offers deletion for drafts and published records with its impact explained", () => {
  const root = new URL("..", import.meta.url).pathname;
  const rendered = Bun.spawnSync([process.execPath, "--eval", `
    import { mock } from "bun:test";
    import { createElement } from "react";
    import { renderToStaticMarkup } from "react-dom/server";
    mock.module(${JSON.stringify(`${root}src/lib/admin/actions.ts`)}, () => Object.fromEntries([
      "deleteContent", "publishContent", "saveTopic", "saveSubject", "savePractice", "saveAnnouncement", "saveRecording", "saveEvent",
    ].map(name => [name, async () => ({ success: true })])));
    // Portal behaviour is verified in browser; render its descriptive content here.
    mock.module(${JSON.stringify(`${root}src/components/ui/alert-dialog.tsx`)}, () => {
      const shell = ({children}) => createElement("div", null, children);
      const trigger = ({children, render}) => createElement("button", {"aria-label":render.props["aria-label"]}, children);
      return Object.fromEntries(["AlertDialog", "AlertDialogContent", "AlertDialogHeader", "AlertDialogTitle", "AlertDialogDescription", "AlertDialogFooter", "AlertDialogAction", "AlertDialogCancel"].map(name => [name, shell]).concat([["AlertDialogTrigger", trigger]]));
    });
    const { ContentManager } = await import(${JSON.stringify(`${root}src/components/admin/content-manager.tsx`)});
    const fixture = { id:"fixture", title:"Konten pengujian", description:"Deskripsi", topicId:"topic", topic:{title:"Induk"},
      questions:[], summary:"Ringkasan", content:"Isi", lessonDate:"2026-10-21T00:00:00Z", url:"https://example.com/video",
      details:"Keterangan", startsAt:"2026-10-21T00:00:00Z", endsAt:"2026-10-21T01:00:00Z" };
    const sections = {topics:"topics", subjects:"subjects", practice:"activities", announcements:"announcements", recordings:"recordings", events:"events"};
    const output = {};
    for (const [section, key] of Object.entries(sections)) {
      for (const published of [false, true]) {
        const content = {topics:[], subjects:[], activities:[], announcements:[], recordings:[], events:[], topicOptions:[], subjectOptions:[], materialDrafts:[], materials:[], accounts:[], hasNext:false, [key]:[{...fixture,published}]};
        output[section + published] = renderToStaticMarkup(createElement(ContentManager, {section,content}));
      }
    }
    console.log(JSON.stringify(output));
  `], { cwd: root });
  expect(rendered.exitCode).toBe(0);
  expect(rendered.stderr.toString()).toBe("");
  const html: Record<string, string> = JSON.parse(rendered.stdout.toString());
  for (const output of Object.values(html)) {
    expect(output).toContain('aria-label="Hapus Konten pengujian"');
    expect(output).toContain("Konten pengujian akan dihapus permanen.");
    expect(output).toContain("Batal");
    expect(output).toContain("Hapus permanen");
  }
  expect(html.topicstrue).toContain("tidak memiliki subjek");
  expect(html.subjectstrue).toContain("tidak memiliki materi atau draft materi");
  expect(html.practicetrue).toContain("sudah memiliki pengerjaan tidak dapat dihapus");
  expect(html.practicetrue).toContain("seluruh soal latihan ikut dihapus");
  expect(html.recordingstrue).toContain("Video di layanan eksternal tetap tersimpan");
  expect(html.announcementstrue).toContain("Pengumuman tidak lagi tersedia");
  expect(html.eventstrue).toContain("dihapus dari jadwal");
});
