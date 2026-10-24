import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  const t = useTranslations("UI");

  return (
    <section className="page-stack" aria-busy="true" aria-label={t("Memuat_halaman")}>
      <p role="status" className="sr-only">
        {t("Memuat_halaman61")}
      </p>
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-3/4 max-w-md" />
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-36 rounded-xl" />
        ))}
      </div>
    </section>
  );
}
