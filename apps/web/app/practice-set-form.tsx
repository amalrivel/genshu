import { useEffect, useRef, useState } from "react";
import { useFetcher, useNavigate } from "react-router";
import type { PracticeSet, Question, savePracticeSet } from "./content-api";

type Props = { questions: Question[]; record?: PracticeSet };

export function PracticeSetForm({ questions, record }: Props) {
  const fetcher = useFetcher<typeof savePracticeSet>();
  const navigate = useNavigate();
  const form = useRef<HTMLFormElement>(null);
  const error = useRef<HTMLParagraphElement>(null);
  const [selectedIds, setSelectedIds] = useState(() => record?.questions.map((question) => question.id) ?? []);
  const busy = fetcher.state !== "idle";
  const byId = new Map(questions.map((question) => [question.id, question]));
  const selected = selectedIds.flatMap((id) => {
    const question = byId.get(id);
    return question ? [question] : [];
  });

  useEffect(() => {
    if (fetcher.data?.ok && fetcher.data.intent === "create") {
      form.current?.reset();
      setSelectedIds([]);
    }
    if (fetcher.data?.ok && fetcher.data.intent === "delete" && record) navigate("/practice-sets");
    if (fetcher.data?.error) error.current?.focus();
  }, [fetcher.data]);

  function move(index: number, direction: -1 | 1) {
    setSelectedIds((ids) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= ids.length) return ids;
      const next = [...ids];
      [next[index], next[nextIndex]] = [next[nextIndex]!, next[index]!];
      return next;
    });
  }

  return <fetcher.Form method="post" ref={form} className="content-form practice-set-form">
    {record && <input type="hidden" name="id" value={record.id} />}
    {selectedIds.map((id) => <input key={id} type="hidden" name="questionId" value={id} />)}
    <fieldset disabled={busy}>
      <legend>{record ? "Edit practice set" : "New practice set"}</legend>
      <label>Title<input name="title" required defaultValue={record?.title ?? ""} /></label>
      <label>Description (optional)<textarea name="description" rows={3} defaultValue={record?.description ?? ""} /></label>
      <h3>Question bank</h3>
      {!questions.length && <p>Create questions before selecting them for a practice set.</p>}
      <ul className="question-selector">{questions.map((question) => <li key={question.id}>
        <label><input type="checkbox" checked={selectedIds.includes(question.id)} onChange={() => setSelectedIds((ids) =>
          ids.includes(question.id) ? ids.filter((id) => id !== question.id) : [...ids, question.id])} />
          <span lang="ja">{question.japaneseText}</span><span lang="id">{question.indonesianTranslation}</span>
        </label>
      </li>)}</ul>
      <h3>Selected questions</h3>
      {!selected.length && <p>No questions selected.</p>}
      <ol className="selected-questions">{selected.map((question, index) => <li key={question.id}>
        <div><span lang="ja">{question.japaneseText}</span><span lang="id">{question.indonesianTranslation}</span></div>
        <div className="actions"><button type="button" onClick={() => move(index, -1)} disabled={index === 0}>Move up</button>
          <button type="button" onClick={() => move(index, 1)} disabled={index === selected.length - 1}>Move down</button></div>
      </li>)}</ol>
      <div className="actions">
        <button type="submit" name="intent" value="save">{busy ? "Working…" : record ? "Save changes" : "Create practice set"}</button>
        {record && <button type="button" className="danger" onClick={() => {
          if (window.confirm(`Delete “${record.title}”? This cannot be undone.`)) {
            fetcher.submit({ id: String(record.id), intent: "delete" }, { method: "post" });
          }
        }}>Delete practice set</button>}
      </div>
    </fieldset>
    {fetcher.data?.error && <p role="alert" tabIndex={-1} ref={error}>{fetcher.data.error}</p>}
    {fetcher.data?.ok && !busy && <p role="status">{fetcher.data.intent === "create" ? "Created." : "Saved."}</p>}
  </fetcher.Form>;
}
