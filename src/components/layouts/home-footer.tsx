import { useTranslations } from "next-intl";
export default function HomeFooter() {
  const t = useTranslations("UI");

  return (
    <footer className="px-4 pb-28 pt-4 text-center text-xs text-muted-foreground md:pb-6">
      {t("Genshu_Ruang_belajar_bahasa_Jepang")}
    </footer>
  );
}
