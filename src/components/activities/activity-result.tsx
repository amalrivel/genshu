"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import type { ActivityResult } from "@/lib/activities/types";

export function ActivityResultView({ activityTitle, result, onRetry, pending, error }: { activityTitle: string; result: ActivityResult; onRetry: () => void; pending: boolean; error: string | null }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <header className="page-header min-w-0"><p>Latihan selesai</p><h1 ref={heading} tabIndex={-1}>Hasil latihan Anda</h1><p className="break-words">{activityTitle}</p><p>Setiap latihan adalah kesempatan untuk memahami lebih baik.</p></header>
    <Card><CardHeader><CardDescription>Nilai Anda</CardDescription><CardTitle><span className="text-5xl font-semibold tracking-tight tabular-nums">{result.score}<span className="text-xl text-muted-foreground"> / 100</span></span></CardTitle></CardHeader>
      <CardContent><dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Jumlah soal", result.total], ["Benar", result.correct], ["Salah", result.incorrect], ["Belum dijawab", result.unanswered]].map(([label, count]) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="text-xl font-semibold tabular-nums">{count}</dd></div>)}</dl></CardContent>
    </Card>
    {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
    <div className="flex flex-wrap gap-3"><Button onClick={onRetry} disabled={pending}>{pending ? <><Spinner aria-hidden="true" />Membuka latihan…</> : "Ulangi latihan"}</Button><Link className={buttonVariants({ variant: "outline" })} href="/activities">Kembali ke latihan</Link></div>
    <h2>Ulasan jawaban</h2>
    <ol className="flex flex-col gap-3">{result.questions.map((question, index) => <li key={question.questionId} className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="min-w-0 flex-1 break-words font-medium">{index + 1}. {question.question}</h3><Badge variant={question.userAnswer === null ? "warning" : question.isCorrect ? "success" : "destructive"}>{question.userAnswer === null ? "Belum dijawab" : question.isCorrect ? "Jawaban benar" : "Jawaban keliru"}</Badge></div>
      <dl className="grid gap-1 text-sm"><div><dt className="inline text-muted-foreground">Jawaban Anda: </dt><dd className="inline">{question.userAnswer === null ? "Belum dijawab" : question.userAnswer ? "Benar" : "Salah"}</dd></div><div><dt className="inline text-muted-foreground">Kunci jawaban: </dt><dd className="inline font-medium">{question.correctAnswer ? "Benar" : "Salah"}</dd></div></dl>
    </li>)}</ol>
  </section>;
}
