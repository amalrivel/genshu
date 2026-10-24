import { beforeAll, expect, test } from "bun:test";

let html: Record<string, string>;

beforeAll(() => {
  const root = new URL("..", import.meta.url).pathname;
  // Render client components separately from the suite's react-server condition.
  const rendered = Bun.spawnSync(
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

    // Portal focus and interaction are covered in browser QA; expose its content here.
    mock.module(${JSON.stringify(`${root}src/components/ui/alert-dialog.tsx`)}, () => {
      const shell = ({ children }) => createElement("div", null, children);
      const action = ({ children, disabled }) => createElement("button", { disabled }, children);
      return { AlertDialog: shell, AlertDialogContent: shell, AlertDialogHeader: shell,
        AlertDialogTitle: shell, AlertDialogDescription: shell, AlertDialogFooter: shell,
        AlertDialogCancel: action, AlertDialogAction: action };
    });
    const { ActivityReviewDialog } = await import(${JSON.stringify(`${root}src/components/activities/activity-review.tsx`)});
    const { ActivityResultView } = await import(${JSON.stringify(`${root}src/components/activities/activity-result.tsx`)});
    const { gradeActivity } = await import(${JSON.stringify(`${root}src/lib/activities/grading.ts`)});
    const questions = [
      { id: "yes", question: "Pernyataan pertama", correctAnswer: false },
      { id: "no", question: "Pernyataan kedua", correctAnswer: false },
      { id: "empty", question: "Pernyataan ketiga", correctAnswer: true },
    ];
    const answers = { yes: true, no: false };
    const reviewProps = { open: true, pending: false, questions, answers,
      onOpenChange() {}, onEdit() {}, onSubmit() {} };
    const render = (Component, props) => renderWithLocale(createElement(Component, props));
    console.log(JSON.stringify({
      review: render(ActivityReviewDialog, reviewProps),
      pending: render(ActivityReviewDialog, { ...reviewProps, pending: true }),
      complete: render(ActivityReviewDialog, { ...reviewProps, answers: { ...answers, empty: false } }),
      result: render(ActivityResultView, { activityTitle: "Latihan negasi", result: gradeActivity("test", questions, answers),
        onRetry() {}, pending: false, error: null }),
    }));
  `,
    ],
    { cwd: root },
  );
  expect(rendered.exitCode).toBe(0);
  expect(rendered.stderr.toString()).toBe("");
  html = JSON.parse(rendered.stdout.toString());
});

test("review preserves true, false and unanswered choices without revealing answer keys", () => {
  const items = html.review.match(/<li\b[\s\S]*?<\/li>/g) ?? [];
  expect(items).toHaveLength(3);
  expect(items[0]).toContain("Pernyataan pertama");
  expect(items[0]).toContain(">Benar</span>");
  expect(items[1]).toContain("Pernyataan kedua");
  expect(items[1]).toContain(">Salah</span>");
  expect(items[2]).toContain("Pernyataan ketiga");
  expect(items[2]).toContain("Belum dijawab");
  expect(html.review).toContain("2 dari 3 soal sudah dijawab");
  expect(html.review).toContain("Soal yang belum dijawab tidak mendapat nilai");
  expect(html.review).not.toContain("Kunci jawaban");
  expect(html.complete).toContain("Semua soal sudah dijawab");
  for (const number of [1, 2, 3]) expect(html.review).toContain(`Ubah soal ${number}`);
  const buttons = html.pending.match(/<button\b[^>]*>/g) ?? [];
  expect(buttons).toHaveLength(5);
  expect(buttons.every((button) => button.includes("disabled"))).toBe(true);
  expect(html.pending).toContain("Mengirim…");
});

test("results name the activity and distinguish correctness from the true/false choice", () => {
  const items = html.result.match(/<li\b[\s\S]*?<\/li>/g) ?? [];
  expect(html.result).toContain("Latihan negasi");
  expect(html.result).toContain("33");
  expect(items).toHaveLength(3);
  expect(items[0]).toContain("Jawaban keliru");
  expect(items[0]).toContain('<dd class="inline">Benar</dd>');
  expect(items[1]).toContain("Jawaban benar");
  expect(items[1]).toContain('<dd class="inline">Salah</dd>');
  expect(items[2]).toContain("Belum dijawab");
});
