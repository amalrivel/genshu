"use client";
import { useTranslations } from "next-intl";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HomeError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("UI");

  return (
    <section className="page-stack">
      <header className="page-header">
        <h1>{t("Halaman_belum_dapat_dimuat")}</h1>
        <p>{t("Silakan_coba_lagi_Data_Anda_tetap_tersimpan")}</p>
      </header>
      <Alert variant="destructive">
        <AlertDescription>
          {t(
            "Terjadi_kendala_saat_mengambil_data_Periksa_koneksi_Anda_atau_kembali_beberapa_saat_l",
          )}
        </AlertDescription>
      </Alert>
      <div className="flex flex-wrap gap-3">
        <Button onClick={retry}>{t("Coba_lagi")}</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          {t("Kembali_ke_beranda")}
        </Link>
      </div>
    </section>
  );
}
