import { Link } from "react-router";
import type { Route } from "./+types/topic";
import { api, requireAdmin, saveContent, type Topic, type Material, type Question } from "../content-api";
import { ContentForm, QuestionForm } from "../content-form";

export const meta = () => [{ title: "Materials · Genshu" }];
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  await requireAdmin();
  const id = encodeURIComponent(params.topicId);
  const [topic, materials, questions] = await Promise.all([
    api<Topic>(`/topics/${id}`), api<Material[]>(`/materials?topicId=${id}`), api<Question[]>(`/questions?topicId=${id}`),
  ]);
  return { topic, materials, questions };
}
export async function clientAction({ request, params }: Route.ClientActionArgs) {
  const form = await request.clone().formData();
  return saveContent(request, form.get("resource") === "questions" ? "questions" : "materials", params.topicId);
}
export function HydrateFallback() { return <main className="content-admin"><p role="status">Loading materials…</p></main>; }

export default function TopicPage({ loaderData }: Route.ComponentProps) {
  const { topic, materials, questions } = loaderData;
  return <main className="content-admin">
    <nav><Link to="/topics">← All topics</Link></nav>
    <h1>{topic.title}</h1>
    <p>Materials and questions are listed alphabetically. Content is saved as Markdown or plain text.</p>
    <ContentForm key={topic.id} kind="material" />
    <h2>Materials</h2>
    {!materials.length && <p>No materials yet. Create the first material above.</p>}
    <ul className="content-list">{materials.map((material) => <li key={material.id}>
      <h3>{material.title}</h3>
      <ContentForm kind="material" record={material} />
    </li>)}</ul>
    <h2>Questions</h2>
    <QuestionForm />
    {!questions.length && <p>No questions yet. Create the first question above.</p>}
    <ul className="content-list">{questions.map((question) => <li key={question.id}>
      <h3 lang="ja">{question.japaneseText}</h3>
      {question.furigana && <p lang="ja">{question.furigana}</p>}
      <p lang="id">{question.indonesianTranslation}</p>
      <p><strong>{question.correctAnswer ? "○ Maru / True" : "× Batsu / False"}</strong></p>
      <p lang="ja">{question.japaneseExplanation}</p>
      <p lang="id">{question.indonesianExplanation}</p>
      <QuestionForm record={question} />
    </li>)}</ul>
  </main>;
}

export { ContentError as ErrorBoundary } from "../content-form";
