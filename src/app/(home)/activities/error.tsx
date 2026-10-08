"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// NOTE: Boundary ini menangani kegagalan render/pemuatan di Activities dan
// route turunannya, misalnya database tidak tersedia. Data yang tidak ditemukan
// tetap menggunakan not-found.tsx; daftar kosong tetap menjadi tampilan normal.
// Error submit ditangani runner agar jawaban pengguna tidak hilang akibat
// mengganti seluruh halaman dengan fallback ini.
export default function ActivitiesError({ retry }: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  // NOTE: Next.js versi proyek ini menyediakan retry untuk mengambil ulang
  // konten server, bukan sekadar membersihkan error state. Jangan tampilkan
  // error.message mentah karena detail database tidak dibutuhkan pengguna.
  // TODO: Hubungkan digest dengan pelaporan error server saat observability dibuat.
  return (
    <section className="space-y-4">
      <h1>Could not load activity content</h1>
      <p role="alert">Please try again. If the problem continues, come back later.</p>
      <Button type="button" onClick={retry}>Try again</Button>
      <Link href="/activities" className="block underline">Back to Activities</Link>
    </section>
  );
}
