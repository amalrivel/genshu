import { useEffect, useRef } from "react";
import { Link, useFetcher, useRevalidator, useRouteError } from "react-router";
import type { Question, saveContent } from "./content-api";

type Props = {
  kind: "topic" | "material";
  record?: { id: number; title: string; content?: string };
};

export function ContentForm({ kind, record }: Props) {
  const fetcher = useFetcher<typeof saveContent>();
  const form = useRef<HTMLFormElement>(null);
  const error = useRef<HTMLParagraphElement>(null);
  const busy = fetcher.state !== "idle";
  useEffect(() => {
    if (fetcher.data?.ok && fetcher.data.intent === "create") form.current?.reset();
    if (fetcher.data?.error) error.current?.focus();
  }, [fetcher.data]);

  return (
    <fetcher.Form method="post" ref={form} className="content-form">
      {record && <input type="hidden" name="id" value={record.id} />}
      <fieldset disabled={busy}>
        <legend>{record ? `Edit ${kind}` : `New ${kind}`}</legend>
        <label>Title<input name="title" required defaultValue={record?.title ?? ""} /></label>
        {kind === "material" && <label>Content (Markdown or plain text)
          <textarea name="content" required rows={8} defaultValue={record?.content ?? ""} />
        </label>}
        <div className="actions">
          <button type="submit" name="intent" value="save">{busy ? "Working…" : record ? "Save changes" : `Create ${kind}`}</button>
          {record && <button type="button" className="danger" onClick={() => {
            if (window.confirm(`Delete “${record.title}”? This cannot be undone.`)) {
              fetcher.submit({ id: String(record.id), intent: "delete" }, { method: "post" });
            }
          }}>Delete {kind}</button>}
        </div>
      </fieldset>
      {fetcher.data?.error && <p role="alert" tabIndex={-1} ref={error}>{fetcher.data.error}</p>}
      {fetcher.data?.ok && !busy && <p role="status">{fetcher.data.intent === "create" ? "Created." : "Saved."}</p>}
    </fetcher.Form>
  );
}

export function ContentError() {
  const error = useRouteError();
  const revalidator = useRevalidator();
  return <main className="content-admin">
    <h1>Unable to load content</h1>
    <p role="alert">{error instanceof Error ? error.message : "Please try again."}</p>
    <p><Link to="/topics">All topics</Link> · <Link to="/">Home</Link></p>
    <button type="button" disabled={revalidator.state !== "idle"} onClick={() => revalidator.revalidate()}>Try again</button>
  </main>;
}

export function QuestionForm({ record }: { record?: Question }) {
  const fetcher = useFetcher<typeof saveContent>();
  const form = useRef<HTMLFormElement>(null);
  const error = useRef<HTMLParagraphElement>(null);
  const busy = fetcher.state !== "idle";
  useEffect(() => {
    if (fetcher.data?.ok && fetcher.data.intent === "create") form.current?.reset();
    if (fetcher.data?.error) error.current?.focus();
  }, [fetcher.data]);

  return (
    <fetcher.Form method="post" ref={form} className="content-form question-form">
      <input type="hidden" name="resource" value="questions" />
      {record && <input type="hidden" name="id" value={record.id} />}
      <fieldset disabled={busy}>
        <legend>{record ? "Edit question" : "New question"}</legend>
        <label>Japanese text<textarea name="japaneseText" required rows={3} defaultValue={record?.japaneseText ?? ""} /></label>
        <label>Furigana (optional)<input name="furigana" defaultValue={record?.furigana ?? ""} /></label>
        <label>Indonesian translation<textarea name="indonesianTranslation" required rows={3} defaultValue={record?.indonesianTranslation ?? ""} /></label>
        <label>Correct answer<select name="correctAnswer" required defaultValue={record?.correctAnswer ? "true" : "false"}>
          <option value="true">○ Maru / True</option><option value="false">× Batsu / False</option>
        </select></label>
        <label>Japanese explanation<textarea name="japaneseExplanation" required rows={3} defaultValue={record?.japaneseExplanation ?? ""} /></label>
        <label>Indonesian explanation<textarea name="indonesianExplanation" required rows={3} defaultValue={record?.indonesianExplanation ?? ""} /></label>
        <div className="actions">
          <button type="submit" name="intent" value="save">{busy ? "Working…" : record ? "Save changes" : "Create question"}</button>
          {record && <button type="button" className="danger" onClick={() => {
            if (window.confirm("Delete this question? This cannot be undone.")) {
              fetcher.submit({ id: String(record.id), resource: "questions", intent: "delete" }, { method: "post" });
            }
          }}>Delete question</button>}
        </div>
      </fieldset>
      {fetcher.data?.error && <p role="alert" tabIndex={-1} ref={error}>{fetcher.data.error}</p>}
      {fetcher.data?.ok && !busy && <p role="status">{fetcher.data.intent === "create" ? "Created." : "Saved."}</p>}
    </fetcher.Form>
  );
}
