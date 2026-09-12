import { Link } from "react-router";
import type { Route } from "./+types/topic";
import { api, saveContent, type Topic, type Material } from "../content-api";
import { ContentForm } from "../content-form";

export const meta = () => [{ title: "Materials · Genshu" }];
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = encodeURIComponent(params.topicId);
  const [topic, materials] = await Promise.all([
    api<Topic>(`/topics/${id}`), api<Material[]>(`/materials?topicId=${id}`),
  ]);
  return { topic, materials };
}
export async function clientAction({ request, params }: Route.ClientActionArgs) {
  return saveContent(request, "materials", params.topicId);
}
export function HydrateFallback() { return <main className="content-admin"><p role="status">Loading materials…</p></main>; }

export default function TopicPage({ loaderData }: Route.ComponentProps) {
  const { topic, materials } = loaderData;
  return <main className="content-admin">
    <nav><Link to="/topics">← All topics</Link></nav>
    <h1>{topic.title}</h1>
    <p>Materials are listed alphabetically. Content is saved as Markdown or plain text.</p>
    <ContentForm key={topic.id} kind="material" />
    <h2>Materials</h2>
    {!materials.length && <p>No materials yet. Create the first material above.</p>}
    <ul className="content-list">{materials.map((material) => <li key={material.id}>
      <h3>{material.title}</h3>
      <ContentForm kind="material" record={material} />
    </li>)}</ul>
  </main>;
}

export { ContentError as ErrorBoundary } from "../content-form";
