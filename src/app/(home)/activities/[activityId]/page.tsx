import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityRunner } from "@/components/activities/activity-runner";
import { PracticeLaunch } from "@/components/activities/practice-launch";
import { requireUser } from "@/lib/auth-session";
import { getActivity, getAttempt, getOpenAttempt, parseAttemptAnswers, parseAttemptQuestions, parseAttemptResult, clientQuestions } from "@/lib/activities/queries";

export default async function ActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const [{ activityId }, { attempt: attemptId }, session] = await Promise.all([params, searchParams, requireUser()]);
  const activity = await getActivity(activityId);
  if (!activity) notFound();

  if (!attemptId) {
    const draft = await getOpenAttempt(activityId, session.user.id);
    return <section className="space-y-4">
      <Link href="/activities" className="underline">Back to practice</Link>
      <h1 className="text-2xl font-semibold">{activity.title}</h1>
      <p>{activity.description}</p>
      <p>{activity.questions.length} questions</p>
      <PracticeLaunch activityId={activity.id} resumeAttemptId={draft?.id} />
    </section>;
  }

  const attempt = await getAttempt(attemptId, session.user.id);
  if (!attempt || attempt.activityId !== activity.id) notFound();
  const questions = parseAttemptQuestions(attempt.questionsSnapshot);
  if (!questions.length) notFound();
  return <ActivityRunner
    key={attempt.id}
    activity={{ ...activity, questions: clientQuestions(questions) }}
    attemptId={attempt.id}
    initialAnswers={parseAttemptAnswers(attempt.answers)}
    initialResult={parseAttemptResult(attempt.result)}
  />;
}
