import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UI");
  return { title: t("Masuk") };
}
import { LoginForm } from "@/components/login/login-form";
import { getSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import { demoPassword, demoUsers, isDemoLoginEnabled } from "@/lib/demo-accounts";

export default async function Login() {
  if (await getSession()) redirect("/");
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <LoginForm
          demoAccounts={
            isDemoLoginEnabled(process.env.NODE_ENV, process.env.GENSHU_ENABLE_DEMO_LOGIN)
              ? { users: demoUsers, password: demoPassword }
              : undefined
          }
        />
      </div>
    </div>
  );
}
