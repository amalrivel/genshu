import { Link } from "react-router";
import type { Route } from "./+types/practice-sets";
import { api, requireAdmin, savePracticeSet, type PracticeSetSummary, type Question } from "../content-api";
import { PracticeSetForm } from "../practice-set-form";
import { ContentError } from "../content-form";

export const meta = () => [{ title: "Practice sets · Genshu" }];
export async function clientLoader() {
  await requireAdmin();
  const [practiceSets, questions] = await Promise.all([
    api<PracticeSetSummary[]>("/practice-sets"), api<Question[]>("/questions"),
  ]);
  return { practiceSets, questions };
}
export async function clientAction({ request }: Route.ClientActionArgs) {
  return savePracticeSet(request);
}
export function HydrateFallback() { return <main className="content-admin"><p role="status">Loading practice sets…</p></main>; }

export default function PracticeSets({ loaderData }: Route.ComponentProps) {
  return <main className="content-admin">
    <nav><Link to="/">Genshu home</Link> · <Link to="/topics">Topics and questions</Link></nav>
    <h1>Practice sets</h1>
    <p>Create a set, select questions, and put them in the study order you want.</p>
    <PracticeSetForm questions={loaderData.questions} />
    <h2>All practice sets</h2>
    {!loaderData.practiceSets.length && <p>No practice sets yet. Create the first set above.</p>}
    <ul className="content-list">{loaderData.practiceSets.map((practiceSet) => <li key={practiceSet.id}>
      <h3><Link to={`/practice-sets/${practiceSet.id}`}>{practiceSet.title}</Link></h3>
      {practiceSet.description && <p>{practiceSet.description}</p>}
    </li>)}</ul>
  </main>;
}

export { ContentError as ErrorBoundary };
