import { Link } from "react-router";
import type { Route } from "./+types/practice-set";
import {
  api,
  requireAdmin,
  savePracticeSet,
  type PracticeSet,
  type Question,
} from "../content-api";
import { PracticeSetForm } from "../practice-set-form";
import { ContentError } from "../content-form";

export const meta = () => [{ title: "Edit practice set · Genshu" }];
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  await requireAdmin();
  const id = encodeURIComponent(params.practiceSetId);
  const [practiceSet, questions] = await Promise.all([
    api<PracticeSet>(`/practice-sets/${id}`),
    api<Question[]>("/questions"),
  ]);
  return { practiceSet, questions };
}
export async function clientAction({ request }: Route.ClientActionArgs) {
  return savePracticeSet(request);
}
export function HydrateFallback() {
  return (
    <main className="content-admin">
      <p role="status">Loading practice set…</p>
    </main>
  );
}

export default function PracticeSetPage({ loaderData }: Route.ComponentProps) {
  return (
    <main className="content-admin">
      <nav>
        <Link to="/practice-sets">← All practice sets</Link>
      </nav>
      <h1>{loaderData.practiceSet.title}</h1>
      <PracticeSetForm
        key={loaderData.practiceSet.id}
        record={loaderData.practiceSet}
        questions={loaderData.questions}
      />
    </main>
  );
}

export { ContentError as ErrorBoundary };
