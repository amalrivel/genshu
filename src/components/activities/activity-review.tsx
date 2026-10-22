import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import type { Answers, Question } from "@/lib/activities/types";

export function ActivityReviewDialog({ open, pending, questions, answers, onOpenChange, onEdit, onSubmit, finalFocus }: {
  open: boolean;
  pending: boolean;
  questions: Question[];
  answers: Answers;
  onOpenChange: (open: boolean) => void;
  onEdit: (index: number) => void;
  onSubmit: () => void;
  finalFocus?: ComponentProps<typeof AlertDialogContent>["finalFocus"];
}) {
  const answered = questions.filter((question) => typeof answers[question.id] === "boolean").length;
  const unanswered = questions.length - answered;

  return <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent finalFocus={finalFocus} className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto data-[size=default]:max-w-2xl data-[size=default]:sm:max-w-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle>Tinjau jawaban Anda</AlertDialogTitle>
        <AlertDialogDescription>
          {answered} dari {questions.length} soal sudah dijawab. {unanswered ? `Masih ada ${unanswered} soal belum dijawab. Soal yang belum dijawab tidak mendapat nilai.` : "Semua soal sudah dijawab."} Setelah dikirim, jawaban latihan ini tidak dapat diubah.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <ol className="flex min-w-0 flex-col gap-3" aria-label="Jawaban yang akan dikirim">
        {questions.map((question, index) => {
          const value = answers[question.id];
          const hasAnswer = typeof value === "boolean";
          return <li key={question.id} className="flex min-w-0 flex-col gap-3 rounded-xl border p-4">
            <p className="break-words font-medium">{index + 1}. {question.question}</p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex flex-wrap items-center gap-2 text-sm"><span className="text-muted-foreground">Jawaban Anda:</span><Badge variant={hasAnswer ? "secondary" : "warning"}>{hasAnswer ? value ? "Benar" : "Salah" : "Belum dijawab"}</Badge></p>
              <Button variant="outline" disabled={pending} onClick={() => onEdit(index)}>Ubah soal {index + 1}</Button>
            </div>
          </li>;
        })}
      </ol>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={pending}>Kembali mengerjakan</AlertDialogCancel>
        <AlertDialogAction disabled={pending} onClick={onSubmit}>{pending ? <><Spinner aria-hidden="true" />Mengirim…</> : "Kirim jawaban"}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
