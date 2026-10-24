import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UI");
  return { title: t("Beranda") };
}
import { HomeDashboard } from "@/components/home/home-dashboard";
import { requireUser } from "@/lib/auth-session";
import { getPublishedAnnouncements } from "@/lib/announcements/queries";
import { getRecentResults, getLatestOpenAttempt } from "@/lib/activities/queries";

export default async function HomePage() {
  const session = await requireUser();
  const [announcements, recentPractice, openAttempt] = await Promise.all([
    getPublishedAnnouncements(3),
    getRecentResults(session.user.id, 5),
    getLatestOpenAttempt(session.user.id),
  ]);
  return (
    <HomeDashboard
      name={session.user.name}
      openAttempt={openAttempt}
      announcements={announcements}
      recentPractice={recentPractice}
    />
  );
}
