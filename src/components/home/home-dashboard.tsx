import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { CollectionEmpty } from "@/components/layouts/collection-empty";

type Announcement = { id: string; title: string; summary: string; publishedAt: string | null };
type RecentPractice = {
  id: string;
  activityId: string;
  activityTitle: string;
  result: unknown;
  submittedAt: string | null;
};
type OpenAttempt = { id: string; activityId: string; title: string; savedAt: string };

export function HomeDashboard({
  name,
  announcements,
  recentPractice,
  openAttempt,
}: {
  name: string;
  announcements: Announcement[];
  recentPractice: RecentPractice[];
  openAttempt: OpenAttempt | null;
}) {
  const locale = useLocale();

  const t = useTranslations("UI");

  return (
    <div className="page-stack">
      <header className="page-header">
        <p>{t("Ruang_belajar_Anda")}</p>
        <h1>{t("greeting", { name: name.split(" ")[0] })}</h1>
        <p>{t("Mari_lanjutkan_langkah_kecil_Anda_hari_ini")}</p>
      </header>
      {openAttempt ? (
        <Card>
          <CardHeader>
            <CardDescription>
              <Badge variant="secondary">{t("Latihan_tersimpan")}</Badge>
            </CardDescription>
            <CardTitle>
              <h2>{openAttempt.title}</h2>
            </CardTitle>
            <CardDescription>
              {t("Jawaban_Anda_sudah_tersimpan_Lanjutkan_dari_latihan_terakhir")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              className={buttonVariants()}
              href={`/activities/${openAttempt.activityId}?attempt=${encodeURIComponent(openAttempt.id)}`}
            >
              {t("Lanjutkan_latihan")}
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("Mulai_dari_satu_latihan")}</h2>
            </CardTitle>
            <CardDescription>{t("Pilih_latihan_untuk_menguatkan_pemahaman_Anda")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className={buttonVariants()} href="/activities">
              {t("Mulai_latihan")}
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Link>
          </CardContent>
        </Card>
      )}
      <div className="grid items-start gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{t("Kabar_kelas")}</h2>
            </CardTitle>
            <CardDescription>{t("Informasi_terbaru_dari_guru_Anda")}</CardDescription>
            <CardAction>
              <Link
                href="/announcements"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                {t("Lihat_semua")}
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {announcements.length ? (
              <ul className="divide-y">
                {announcements.map((item) => (
                  <li key={item.id}>
                    <AnnouncementCard announcement={item} />
                  </li>
                ))}
              </ul>
            ) : (
              <CollectionEmpty
                title={t("Belum_ada_pengumuman")}
                description={t("Kabar_terbaru_dari_guru_akan_muncul_di_sini")}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t("Latihan_terakhir")}</h2>
          </CardTitle>
          <CardDescription>{t("Lihat_kembali_hasil_dan_jawaban_Anda")}</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPractice.length ? (
            <ul className="divide-y">
              {recentPractice.map((attempt) => {
                const score =
                  attempt.result &&
                  typeof attempt.result === "object" &&
                  "score" in attempt.result &&
                  typeof attempt.result.score === "number"
                    ? attempt.result.score
                    : null;
                return (
                  <li key={attempt.id}>
                    <Link
                      href={`/activities/${attempt.activityId}?attempt=${encodeURIComponent(attempt.id)}`}
                      className="flex min-h-20 items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block break-words font-medium">
                          {attempt.activityTitle}
                        </span>
                        {attempt.submittedAt ? (
                          <time
                            dateTime={attempt.submittedAt}
                            className="text-sm text-muted-foreground"
                          >
                            {new Intl.DateTimeFormat(locale, {
                              dateStyle: "medium",
                              timeZone: "Asia/Tokyo",
                            }).format(new Date(attempt.submittedAt))}
                          </time>
                        ) : null}
                      </span>
                      <Badge variant="secondary">
                        {score === null ? t("Tersimpan") : `${score}/100`}
                      </Badge>
                      <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
                      <span className="sr-only">{t("Lihat_hasil")}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <CollectionEmpty
              title={t("Belum_ada_hasil_latihan")}
              description={t("Selesaikan_satu_latihan_untuk_melihat_hasil_Anda_di_sini")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
