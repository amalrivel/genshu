import { useTranslations } from "next-intl";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("UI");

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-5 p-6">
      <p className="text-sm text-muted-foreground">Genshu · 404</p>
      <h1>{t("Halaman_tidak_ditemukan")}</h1>
      <p>{t("Periksa_kembali_alamat_halaman_atau_mulai_dari_beranda")}</p>
      <div>
        <Link className={buttonVariants()} href="/">
          {t("Kembali_ke_beranda")}
        </Link>
      </div>
    </main>
  );
}
