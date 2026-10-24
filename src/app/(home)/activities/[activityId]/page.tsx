import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UI");
  return { title: t("Latihan") };
}
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityRunner } from "@/components/activities/activity-runner";
import { PracticeLaunch } from "@/components/activities/practice-launch";
import { requireUser } from "@/lib/auth-session";
import {
  getActivity,
  getAttempt,
  getOpenAttempt,
  parseAttemptAnswers,
  parseAttemptQuestions,
  parseAttemptResult,
  clientQuestions,
} from "@/lib/activities/queries";

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const t = await getTranslations("UI");

  const [{ activityId }, { attempt: attemptId }, session] = await Promise.all([
    params,
    searchParams,
    requireUser(),
  ]);
  const activity = await getActivity(activityId);
  if (!activity) notFound();

  if (!attemptId) {
    const draft = await getOpenAttempt(activityId, session.user.id);
    return (
      <section className="flex flex-col gap-4">
        <Link
          href="/activities"
          className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline"
        >
          {t("Kembali_ke_latihan")}
        </Link>
        <header className="page-header">
          <h1>{activity.title}</h1>
          <p>{activity.description}</p>
        </header>
        <p className="text-sm text-muted-foreground">
          {activity.questions.length} {t("soal")}
        </p>
        <PracticeLaunch activityId={activity.id} resumeAttemptId={draft?.id} />
      </section>
    );
  }

  const attempt = await getAttempt(attemptId, session.user.id);
  if (!attempt || attempt.activityId !== activity.id) notFound();
  const questions = parseAttemptQuestions(attempt.questionsSnapshot);
  if (!questions.length) notFound();
  return (
    <ActivityRunner
      key={attempt.id}
      activity={{ ...activity, questions: clientQuestions(questions) }}
      attemptId={attempt.id}
      initialAnswers={parseAttemptAnswers(attempt.answers)}
      initialResult={parseAttemptResult(attempt.result)}
    />
  );
}
