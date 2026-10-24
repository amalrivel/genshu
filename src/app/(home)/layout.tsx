import { getTranslations } from "next-intl/server";
import HomeFooter from "@/components/layouts/home-footer";
import { PrimaryNavigation } from "@/components/layouts/primary-navigation";
import { requireUser } from "@/lib/auth-session";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UI");
  return {
    title: { default: "Genshu", template: "%s | Genshu" },
    description: t("Ruang_belajar_dan_latihan_bahasa_Jepang_Anda"),
  };
}

export default async function HomeLayout({ children }: LayoutProps<"/">) {
  const session = await requireUser();
  const role = (session.user as typeof session.user & { role?: string }).role ?? "student";
  return (
    <PrimaryNavigation
      management={role === "teacher" || role === "admin"}
      name={session.user.name}
      email={session.user.email}
    >
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-7 pb-28 sm:px-6 md:pb-10 lg:px-8 lg:py-10"
      >
        {children}
      </main>
      <HomeFooter />
    </PrimaryNavigation>
  );
}
