import { expect, test } from "bun:test";
import { createTranslator } from "use-intl/core";
import id from "../messages/id.json";
import ja from "../messages/ja.json";
import { isLocale, defaultLocale } from "../src/i18n/config";
import { translateFeedback } from "../src/i18n/feedback";

test("only Indonesian and Japanese are accepted, with Indonesian as default", () => {
  expect(defaultLocale).toBe("id");
  for (const value of ["id", "ja"]) expect(isLocale(value)).toBe(true);
  for (const value of ["en", "../ja", "", null, {}, ["ja"]]) expect(isLocale(value)).toBe(false);
});

test("both catalogs have matching keys and every ICU message can be rendered", () => {
  for (const namespace of ["UI", "Feedback", "Language"] as const) {
    expect(Object.keys(ja[namespace]).sort()).toEqual(Object.keys(id[namespace]).sort());
    for (const [locale, messages] of [
      ["id", id],
      ["ja", ja],
    ] as const) {
      const t = createTranslator({
        locale,
        messages: messages as Record<string, Record<string, string>>,
        namespace,
        onError(error) {
          throw error;
        },
      });
      for (const [key, message] of Object.entries(messages[namespace])) {
        const values = Object.fromEntries(
          [...message.matchAll(/\{(\w+)/g)].map((match) => [match[1], 2]),
        );
        expect(t(key, values)).not.toBe(`${namespace}.${key}`);
      }
    }
  }
});

test("localizes known action feedback and parameters while preserving unknown content", () => {
  const t = createTranslator({
    locale: "ja",
    messages: ja as Record<string, Record<string, string>>,
    namespace: "Feedback",
  });
  expect(translateFeedback(t, "Perubahan berhasil disimpan.")).toBe("変更を保存しました。");
  expect(translateFeedback(t, "Isian wajib diisi dan maksimal 160 karakter.")).toContain("160文字");
  expect(translateFeedback(t, "Maksimal 500 karakter.")).toContain("500文字");
  expect(
    translateFeedback(t, "Lengkapi pertanyaan dan kunci jawaban soal 3 (maksimal 1.000 karakter)."),
  ).toContain("問題3");
  for (const value of ["Isi yang ditulis admin", "__proto__", "先生の教材"]) {
    expect(translateFeedback(t, value)).toBe(value);
  }
});

test("Japanese and Indonesian UI preserve stored titles, questions and answers", () => {
  const result = Bun.spawnSync(
    [
      process.execPath,
      "--eval",
      `
    import {mock} from "bun:test";
    import {createElement} from "react";
    import {renderToStaticMarkup} from "react-dom/server";
    import {NextIntlClientProvider} from "next-intl";
    import id from "./messages/id.json";
    import ja from "./messages/ja.json";
    const shell = ({children}) => createElement("div", null, children);
    mock.module("./src/components/ui/alert-dialog.tsx", () =>
      Object.fromEntries(["AlertDialog", "AlertDialogContent", "AlertDialogHeader",
        "AlertDialogTitle", "AlertDialogDescription", "AlertDialogFooter",
        "AlertDialogCancel", "AlertDialogAction"].map(key => [key, shell])));
    const {ActivityReviewDialog} = await import("./src/components/activities/activity-review.tsx");
    const {HomeDashboard} = await import("./src/components/home/home-dashboard.tsx");
    const output = {};
    for (const [locale, messages] of [["id", id], ["ja", ja]]) {
      const render = child => renderToStaticMarkup(createElement(NextIntlClientProvider,
        {locale, messages, timeZone:"Asia/Tokyo", onError(error) {throw error;}}, child));
      output[locale] = render(createElement(ActivityReviewDialog, {
        open:true, pending:false, questions:[{id:"q", question:"Kalimat asli 先生", correctAnswer:false}],
        answers:{q:false}, onOpenChange(){}, onEdit(){}, onSubmit(){}
      })) + render(createElement(HomeDashboard, {name:"Rina", announcements:[],
        recentPractice:[], openAttempt:{id:"a", activityId:"practice", title:"Judul asli 日本語", savedAt:"2026-10-24T00:00:00Z"}}));
    }
    console.log(JSON.stringify(output));
  `,
    ],
    { cwd: new URL("..", import.meta.url).pathname },
  );
  expect(result.stderr.toString()).toBe("");
  expect(result.exitCode).toBe(0);
  const html = JSON.parse(result.stdout.toString());
  expect(html.id).toContain("Tinjau jawaban Anda");
  expect(html.ja).toContain("解答を確認");
  expect(html.id).toContain("Salah");
  expect(html.ja).toContain("誤り");
  expect(html.ja).toContain("Rinaさん、こんにちは。");
  for (const locale of ["id", "ja"]) {
    expect(html[locale]).toContain("Kalimat asli 先生");
    expect(html[locale]).toContain("Judul asli 日本語");
    expect(html[locale]).toContain("/activities/practice?attempt=a");
    expect(html[locale]).not.toContain('href="/learn"');
    expect(html[locale]).not.toContain('href="/calendar"');
  }
});
