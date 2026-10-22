// NOTE: Kartu memakai ringkasan agar daftar tidak mengambil seluruh soal atau
// kunci jawaban. Link hanya navigasi; izin pengerjaan harus dicek server ketika
// route detail dibuka dan ketika submit, bukan berdasarkan keberadaan kartu.

// src/components/activities/activity-card.tsx

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  ActivitySummary,
} from "@/lib/activities/types";

export function ActivityCard({
  activity,
}: {
  activity: ActivitySummary;
}) {
  return (
    <Link href={`/activities/${activity.id}`} className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2">
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-start justify-between gap-3"><h2 className="min-w-0 break-words">{activity.title}</h2><ChevronRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground" /></CardTitle>

          <CardDescription>
            <span className="break-words">{activity.description}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">Latihan · {activity.questionCount} soal</p>
          <p className="mt-3 text-sm font-medium text-primary">Mulai latihan</p>
        </CardContent>
      </Card>
    </Link>
  );
}
