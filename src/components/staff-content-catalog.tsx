import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type StaffContent = {
  id: string
  href: string
  title: string
  secondaryTitle: string
  published: boolean
  updatedAt: string
}

export async function StaffContentCatalog({
  items,
  query,
  status,
}: {
  items: StaffContent[]
  query: string
  status: string
}) {
  const t = await getTranslations("staff")
  const common = await getTranslations("common")
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const visibleItems = items.filter((item) => {
    const matchesQuery = `${item.title} ${item.secondaryTitle}`
      .toLocaleLowerCase()
      .includes(normalizedQuery)
    const matchesStatus =
      status === "published" ? item.published :
      status === "draft" ? !item.published : true
    return matchesQuery && matchesStatus
  })

  return (
    <>
      <form method="get" className="mt-6 grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
        <label className="sr-only" htmlFor="staff-content-search">{common("search")}</label>
        <Input id="staff-content-search" name="q" type="search" placeholder={common("search")} defaultValue={query} />
        <label className="sr-only" htmlFor="staff-content-status">{common("status")}</label>
        <select id="staff-content-status" name="status" className="h-10 rounded-md border border-input bg-background px-3 text-sm" defaultValue={status}>
          <option value="all">{common("all")}</option>
          <option value="published">{t("published")}</option>
          <option value="draft">{t("draft")}</option>
        </select>
        <Button type="submit" variant="outline" className="min-h-10 gap-2"><Search className="size-4" />{common("search")}</Button>
      </form>
      <ul className="mt-5 divide-y rounded-lg border">
        {visibleItems.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.secondaryTitle} · {item.updatedAt.slice(0, 10)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={item.published ? "success" : "secondary"}>{t(item.published ? "published" : "draft")}</Badge>
              <Link className="inline-flex min-h-11 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted" href={item.href}>{t("edit")}</Link>
            </div>
          </li>
        ))}
        {visibleItems.length === 0 && <li className="p-6 text-sm text-muted-foreground">{t("noContentMatch")}</li>}
      </ul>
    </>
  )
}
