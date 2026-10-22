"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <section className="flex flex-col gap-4">
      <h1>Latihan belum dapat dimuat</h1>
      <Alert variant="destructive"><AlertDescription>Silakan coba lagi. Jika masih gagal, periksa koneksi Anda atau kembali beberapa saat lagi.</AlertDescription></Alert>
      <Button type="button" onClick={retry}>Coba lagi</Button>
      <Link href="/activities" className="block underline">Kembali ke latihan</Link>
    </section>
  );
}
