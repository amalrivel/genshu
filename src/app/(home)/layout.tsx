import HomeFooter from "@/components/layouts/home-footer";
import HomeHeader from "@/components/layouts/home-header";
import { requireUser } from "@/lib/auth-session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Genshu", template: "%s | Genshu" },
  description: "Learning and practice for managed students.",
};

export default async function HomeLayout({ children }: LayoutProps<"/">) {
  const session = await requireUser();
  const role = (session.user as typeof session.user & { role?: string }).role ?? "student";
  return (
    <>
      <HomeHeader name={session.user.name} email={session.user.email} role={role} />
      <main className="container mx-auto my-4 flex w-full max-w-6xl flex-1 flex-col gap-6 px-4">{children}</main>
      <HomeFooter />
    </>
  );
}
