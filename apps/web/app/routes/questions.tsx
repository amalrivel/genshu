import { Link } from "react-router";
import type { Route } from "./+types/questions";
import { api, requireAdmin, type Question, type Topic } from "../content-api";
import { ContentError } from "../content-form";

export const meta = () => [{ title: "Questions · Genshu" }];
export async function clientLoader() {
  await requireAdmin();
  const [questions, topics] = await Promise.all([
    api<Question[]>("/questions"),
    api<Topic[]>("/topics"),
  ]);
  return { questions, topics };
}
export function HydrateFallback() {
  return (
    <main className="content-admin">
      <p role="status">Loading questions…</p>
    </main>
  );
}

export default function Questions({ loaderData }: Route.ComponentProps) {
  const topics = new Map(
    loaderData.topics.map((topic) => [topic.id, topic.title]),
  );
  return (
    <main className="content-admin">
      <p className="admin-context">Question Bank</p>
      <h1>Questions</h1>
      <p>Review all questions. Open a topic to create or edit its questions.</p>
      {!loaderData.questions.length && (
        <p>No questions yet. Create one from a topic.</p>
      )}
      <ul className="content-list">
        {loaderData.questions.map((question) => (
          <li key={question.id}>
            <h2 lang="ja">{question.japaneseText}</h2>
            <p lang="id">{question.indonesianTranslation}</p>
            <p className="muted-copy">
              Topic: {topics.get(question.topicId) || `#${question.topicId}`}
            </p>
            <Link to={`/topics/${question.topicId}`}>Open topic</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export { ContentError as ErrorBoundary };
