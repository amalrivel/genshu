import { useTranslations } from "next-intl";
// NOTE: 404 dipakai untuk ID/jenis yang tidak tersedia. Jangan menangkap semua
// kegagalan query lalu memanggil notFound: gangguan database perlu error.tsx.

import Link from "next/link";

export default function ActivityNotFound() {
  const t = useTranslations("UI");

  return (
    <section className="flex flex-col gap-4">
      <h1>{t("Latihan_tidak_ditemukan")}</h1>
      <p>{t("Latihan_ini_tidak_tersedia_Periksa_alamat_atau_pilih_latihan_lainnya")}</p>
      <Link href="/activities" className="underline">
        {t("Kembali_ke_latihan6")}
      </Link>
    </section>
  );
}
