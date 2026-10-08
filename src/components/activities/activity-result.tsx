// NOTE: Komponen ini hanya menampilkan hasil server, bukan menghitung ulang nilai.
// TODO: Saat hasil dipersistenkan, buka kembali berdasarkan attempt milik pengguna.
// Tombol retry sekarang memulai ulang state lokal; aturan jumlah percobaan dan
// waktu harus tetap diperiksa server sebelum retry dibolehkan untuk exam/assignment.

// src/components/activities/activity-result.tsx

import { Button } from "@/components/ui/button";

import type {
  ActivityResult,
} from "@/lib/activities/types";

export function ActivityResultView({
  result,
  onRetry,
}: {
  result: ActivityResult;

  onRetry: () => void;
}) {
  return (
    <section>
      <h1>Result</h1>

      <p className="mt-4 text-4xl font-bold">
        {result.score}%
      </p>

      <div className="mt-4 space-y-1">
        <p>
          Total: {result.total}
        </p>

        <p>
          Correct:{" "}
          {result.correct}
        </p>

        <p>
          Incorrect:{" "}
          {result.incorrect}
        </p>

        <p>
          Unanswered:{" "}
          {result.unanswered}
        </p>
      </div>

      <Button
        type="button"
        className="mt-6"
        onClick={onRetry}
      >
        Try Again
      </Button>
    </section>
  );
}