"use client";
import { useTranslations } from "next-intl";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// NOTE: Boundary ini menangani kegagalan render/pemuatan di Activities dan
// route turunannya, misalnya database tidak tersedia. Data yang tidak ditemukan
// tetap menggunakan not-found.tsx; daftar kosong tetap menjadi tampilan normal.
// Error submit ditangani runner agar jawaban pengguna tidak hilang akibat
// mengganti seluruh halaman dengan fallback ini.
export default function ActivitiesError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("UI");

  // NOTE: Next.js versi proyek ini menyediakan retry untuk mengambil ulang
  // konten server, bukan sekadar membersihkan error state. Jangan tampilkan
  // error.message mentah karena detail database tidak dibutuhkan pengguna.
  // TODO: Hubungkan digest dengan pelaporan error server saat observability dibuat.
  return (
    <section className="flex flex-col gap-4">
      <h1>{t("Latihan_belum_dapat_dimuat")}</h1>
      <Alert variant="destructive">
        <AlertDescription>
          {t(
            "Silakan_coba_lagi_Jika_masih_gagal_periksa_koneksi_Anda_atau_kembali_beberapa_saat_la",
          )}
        </AlertDescription>
      </Alert>
      <Button type="button" onClick={retry}>
        {t("Coba_lagi")}
      </Button>
      <Link href="/activities" className="block underline">
        {t("Kembali_ke_latihan6")}
      </Link>
    </section>
  );
}
