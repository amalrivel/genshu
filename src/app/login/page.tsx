import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { currentStaff } from "@/lib/staff"
import { signIn } from "./actions"

export const dynamic = "force-dynamic"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentStaff()) redirect("/staff")
  const { error } = await searchParams
  const t = await getTranslations("staff")
  return <main className="mx-auto w-full max-w-md px-5 py-14">
    <h1 className="text-2xl font-semibold">{t("loginTitle")}</h1>
    <p className="mt-2 text-sm text-muted-foreground">{t("loginDescription")}</p>
    {error && <p role="alert" className="mt-5 rounded-md border border-destructive px-4 py-3 text-sm text-destructive">{error === "forbidden" ? t("forbidden") : error === "unavailable" ? t("unavailable") : t("invalid")}</p>}
    <form action={signIn} className="mt-7 space-y-4">
      <label className="block text-sm font-medium">{t("email")}<input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
      <label className="block text-sm font-medium">{t("password")}<input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
      <button className="min-h-11 w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground">{t("signIn")}</button>
    </form>
  </main>
}
