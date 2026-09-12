import type { Route } from "./+types/dashboard";
import { Link } from "react-router";
import {
  api,
  requireAuth,
  type AuthUser,
  type PracticeSetSummary,
  type Question,
  type Topic,
} from "../content-api";
import { findPracticeDraft, readLastResult } from "../practice-storage";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard · Genshu" },
    { name: "description", content: "Genshu Japanese practice dashboard." },
  ];
}

export async function clientLoader() {
  const user = await requireAuth();
  if (user.role === "Admin") {
    const [topics, questions, practiceSets, users] = await Promise.all([
      api<Topic[]>("/topics"),
      api<Question[]>("/questions"),
      api<PracticeSetSummary[]>("/practice-sets"),
      api<AuthUser[]>("/admin/users"),
    ]);
    return {
      kind: "admin" as const,
      user,
      admin: {
        topics: topics.length,
        questions: questions.length,
        practiceSets: practiceSets.length,
        participants: users.filter((item) => item.role === "Participant")
          .length,
      },
    };
  }
  const practiceSets = await api<PracticeSetSummary[]>("/practice");
  return { kind: "participant" as const, user, practiceSets };
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="dashboard-stat">
      <CardContent>
        <span className="muted-copy">{label}</span>
        <strong>{value}</strong>
      </CardContent>
    </Card>
  );
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const user = loaderData.user;
  if (loaderData.kind === "admin") {
    return (
      <main className="dashboard-page">
        <p className="page-eyebrow">Admin dashboard</p>
        <h1>Welcome back, Admin</h1>
        <p className="page-intro">
          Manage the content participants use to practice.
        </p>
        <section className="dashboard-section">
          <h2>Overview</h2>
          <div className="dashboard-stats">
            <Stat label="Topics" value={loaderData.admin.topics} />
            <Stat label="Questions" value={loaderData.admin.questions} />
            <Stat label="Practice sets" value={loaderData.admin.practiceSets} />
            <Stat label="Participants" value={loaderData.admin.participants} />
          </div>
        </section>
        <section className="dashboard-section">
          <h2>Quick actions</h2>
          <div className="dashboard-actions">
            <Button render={<Link to="/topics" />}>Create question</Button>
            <Button render={<Link to="/practice-sets" />} variant="outline">
              Create practice set
            </Button>
            <Button render={<Link to="/users" />} variant="outline">
              Add participant
            </Button>
          </div>
        </section>
        <section className="dashboard-section dashboard-links">
          <h2>Content management</h2>
          <Link to="/topics">Topics & Materials</Link>
          <Link to="/questions">Question Bank</Link>
          <Link to="/practice-sets">Practice Sets</Link>
          <h2>User management</h2>
          <Link to="/users">Participants</Link>
        </section>
      </main>
    );
  }

  const draft = findPracticeDraft(user.id, loaderData.practiceSets);
  const lastResult = loaderData.practiceSets
    .map((practiceSet) => ({
      practiceSet,
      result: readLastResult(user.id, practiceSet.id),
    }))
    .filter(
      (
        item,
      ): item is {
        practiceSet: PracticeSetSummary;
        result: NonNullable<ReturnType<typeof readLastResult>>;
      } => item.result !== null,
    )
    .sort(
      (a, b) =>
        Date.parse(b.result.submittedAt) - Date.parse(a.result.submittedAt),
    )[0];
  return (
    <main className="dashboard-page">
      <p className="page-eyebrow">Dashboard</p>
      <h1>Welcome back{user.name ? `, ${user.name}` : ""}</h1>
      <p className="page-intro">
        Keep building your Japanese reading confidence, one set at a time.
      </p>
      {draft && (
        <section className="dashboard-section">
          <h2>Continue learning</h2>
          <Card>
            <CardHeader>
              <CardTitle>{draft.practiceSet.title}</CardTitle>
              <CardDescription>
                {Object.keys(draft.draft.answers).length} /{" "}
                {draft.draft.questionIds.length} answered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                render={<Link to={`/practice/${draft.practiceSet.id}`} />}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
      <section className="dashboard-section">
        <h2>Practice</h2>
        <Card>
          <CardHeader>
            <CardTitle>Choose a practice set</CardTitle>
            <CardDescription>
              Answer questions at your own pace. You can change answers before
              submitting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link to="/practice" />}>Open practice sets</Button>
          </CardContent>
        </Card>
      </section>
      {lastResult && (
        <section className="dashboard-section">
          <h2>Recent result</h2>
          <Card>
            <CardContent>
              <strong>
                {lastResult.result.correct} / {lastResult.result.total} correct
              </strong>
              <span className="muted-copy">{lastResult.practiceSet.title}</span>
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}
