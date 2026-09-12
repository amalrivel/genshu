import { Link } from "react-router";
import type { Route } from "./+types/practice";
import { api, requireAuth, type PracticeSetSummary } from "../content-api";
import { ContentError } from "../content-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export const meta = () => [{ title: "Practice · Genshu" }];
export async function clientLoader() {
  await requireAuth();
  const practiceSets = await api<PracticeSetSummary[]>("/practice");
  return { practiceSets };
}
export function HydrateFallback() {
  return (
    <main className="practice-page">
      <p role="status">Loading practice sets…</p>
    </main>
  );
}

export default function PracticeSets({ loaderData }: Route.ComponentProps) {
  const { practiceSets } = loaderData;
  return (
    <main className="practice-page">
      <div className="practice-page__header">
        <div>
          <p className="page-eyebrow">Practice</p>
          <h1>Choose a practice set</h1>
          <p className="page-intro">Answers can be changed until you submit.</p>
        </div>
      </div>
      {!practiceSets.length && (
        <p className="practice-empty">
          No practice content exists yet. An Admin needs to create a Practice
          Set.
        </p>
      )}
      <ul className="practice-set-list">
        {practiceSets.map((practiceSet) => (
          <li key={practiceSet.id}>
            <Card className="practice-set-card">
              <CardHeader>
                <CardTitle>
                  <h2>{practiceSet.title}</h2>
                </CardTitle>
                {practiceSet.description && (
                  <CardDescription>{practiceSet.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent />
              <CardFooter>
                <Link
                  className="practice-link"
                  to={`/practice/${practiceSet.id}`}
                >
                  Open practice set
                </Link>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  );
}

export { ContentError as ErrorBoundary };
