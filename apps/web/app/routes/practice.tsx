import { Link } from "react-router";
import type { Route } from "./+types/practice";
import { api, requireAuth, type PracticeSetSummary } from "../content-api";
import { ContentError } from "../content-form";

export const meta = () => [{ title: "Practice · Genshu" }];
export async function clientLoader() {
  await requireAuth();
  return api<PracticeSetSummary[]>("/practice");
}
export function HydrateFallback() { return <main className="practice-page"><p role="status">Loading practice sets…</p></main>; }

export default function PracticeSets({ loaderData }: Route.ComponentProps) {
  return <main className="practice-page">
    <nav><Link to="/">Genshu home</Link></nav>
    <h1>Practice</h1>
    <p>Choose a practice set to begin.</p>
    {!loaderData.length && <p>No practice sets are available yet.</p>}
    <ul className="practice-set-list">{loaderData.map((practiceSet) => <li key={practiceSet.id}>
      <h2>{practiceSet.title}</h2>
      {practiceSet.description && <p>{practiceSet.description}</p>}
      <Link className="practice-link" to={`/practice/${practiceSet.id}`}>Start practice</Link>
    </li>)}</ul>
  </main>;
}

export { ContentError as ErrorBoundary };
