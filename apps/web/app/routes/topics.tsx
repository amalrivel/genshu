import { Link } from "react-router";
import type { Route } from "./+types/topics";
import { api, saveContent, type Topic } from "../content-api";
import { ContentForm } from "../content-form";

export const meta = () => [{ title: "Topics · Genshu" }];
export async function clientLoader() {
  return { topics: await api<Topic[]>("/topics") };
}
export async function clientAction({ request }: Route.ClientActionArgs) {
  return saveContent(request, "topics");
}
export function HydrateFallback() { return <main className="content-admin"><p role="status">Loading topics…</p></main>; }

export default function Topics({ loaderData }: Route.ComponentProps) {
  return <main className="content-admin">
    <nav><Link to="/">Genshu home</Link></nav>
    <h1>Topics</h1>
    <p>Manage study topics and their materials. Topics are listed alphabetically.</p>
    <ContentForm kind="topic" />
    <h2>All topics</h2>
    {!loaderData.topics.length && <p>No topics yet. Create your first topic above.</p>}
    <ul className="content-list">{loaderData.topics.map((topic) => <li key={topic.id}>
      <h3><Link to={`/topics/${topic.id}`}>{topic.title}</Link></h3>
      <ContentForm kind="topic" record={topic} />
    </li>)}</ul>
  </main>;
}

export { ContentError as ErrorBoundary } from "../content-form";
