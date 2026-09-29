import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { requireStaff } from "@/lib/staff"
import { signOut } from "@/app/login/actions"

export const dynamic = "force-dynamic"

export default async function StaffPage() {
  const staff = await requireStaff()
  const t = await getTranslations("staff")
  return <main className="mx-auto w-full max-w-3xl px-5 py-12">
    <h1 className="text-2xl font-semibold">{t("staffArea")}</h1>
    <p className="mt-2 text-muted-foreground">{t("signedInAs", { name: staff.displayName, role: t(staff.role === "SENSEI" ? "sensei" : "tantosha") })}</p>
    <div className="mt-8 flex flex-wrap gap-3">
      {staff.role === "SENSEI" && <Link className="rounded-md border px-4 py-3" href="/staff/materials">{t("manageMaterials")}</Link>}
      {staff.role === "SENSEI" && <Link className="rounded-md border px-4 py-3" href="/staff/practice">{t("managePractice")}</Link>}
      <Link className="rounded-md border px-4 py-3" href="/materials">{t("viewStudentMaterials")}</Link>
    </div>
    <form action={signOut} className="mt-8"><button className="rounded-md border px-4 py-2">{t("signOut")}</button></form>
  </main>
}
