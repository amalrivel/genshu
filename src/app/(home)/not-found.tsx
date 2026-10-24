import { useTranslations } from "next-intl";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function ContentNotFound() {
  const t = useTranslations("UI");

  return (
    <section className="page-stack">
      <header className="page-header">
        <p>404</p>
        <h1>{t("Konten_tidak_ditemukan")}</h1>
        <p>{t("Konten_ini_belum_tersedia_atau_alamatnya_sudah_berubah")}</p>
      </header>
      <div>
        <Link className={buttonVariants({ variant: "outline" })} href="/">
          {t("Kembali_ke_beranda")}
        </Link>
      </div>
    </section>
  );
}
