import Link from "next/link";
import Form from "next/form";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { ContentManager } from "@/components/admin/content-manager";
import { StudentAccountForm } from "@/components/admin/student-account-form";
import { MaterialImportForm } from "@/components/admin/material-import-form";
import { PendingSubmitButton } from "@/components/admin/pending-submit-button";
import { getManagementContent } from "@/lib/admin/queries";
import { managementSections, managementParams } from "@/lib/admin/types";
import { requireManagement } from "@/lib/auth-session";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

export const metadata: Metadata = { title: "Pengelolaan", description: "Kelola materi, latihan, kabar kelas, dan akun Genshu." };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ section?: string; q?: string; page?: string; status?: string }> }) {
  const session = await requireManagement();
  const role = (session.user as typeof session.user & { role?: string }).role;
  const { section, q, page, status } = managementParams(await searchParams);
  const content = await getManagementContent(section, q, page, status);
  const pageHref = (number: number) => `/admin?${new URLSearchParams({ section, q, ...(section === "materials" ? { status } : {}), page: String(number) })}`;
  return <section className="page-stack">
    <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink render={<Link href="/admin" />}>Pengelolaan</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{managementSections[section]}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
    <header className="page-header"><h1>{managementSections[section]}</h1><p>{section === "accounts" ? "Kelola profil, peran, dan akses akun. Perubahan akun langsung berlaku." : section === "materials" ? "Temukan materi yang sudah terbit atau tinjau draft hasil impor. Materi terbit tersedia di Belajar → Topik → Subjek." : "Simpan perubahan sebagai draft, tinjau, lalu terbitkan."}</p></header>
    <nav aria-label="Bagian pengelolaan" className="flex flex-wrap gap-2">{Object.entries(managementSections).filter(([key]) => key !== "accounts" || role === "admin").map(([key, label]) => <Link key={key} href={`/admin?section=${key}`} aria-current={key === section ? "page" : undefined} className={buttonVariants({ variant: key === section ? "default" : "outline" })}>{label}</Link>)}</nav>
    <div className="flex flex-wrap items-end justify-between gap-4">
      {section === "materials" ? <nav aria-label="Status materi" className="flex gap-2">{([["published", "Materi terbit"], ["draft", "Draft"]] as const).map(([value, label]) => <Link key={value} href={`/admin?${new URLSearchParams({ section, status: value, q })}`} aria-current={status === value ? "page" : undefined} className={buttonVariants({ variant: status === value ? "secondary" : "ghost" })}>{label}</Link>)}</nav> : <h2 className="sr-only">Daftar {managementSections[section]}</h2>}
      <Form action="/admin" scroll={false} className="flex w-full min-w-0 items-end gap-2 sm:max-w-sm"><input type="hidden" name="section" value={section} />{section === "materials" ? <input type="hidden" name="status" value={status} /> : null}<Field><FieldLabel htmlFor="management-search">{section === "accounts" ? "Cari nama atau email" : "Cari judul"}</FieldLabel><Input key={`${section}-${status}-${q}`} id="management-search" name="q" type="search" defaultValue={q} maxLength={120} /></Field><PendingSubmitButton variant="outline" pendingLabel="Mencari…"><Search aria-hidden="true" data-icon="inline-start" />Cari</PendingSubmitButton></Form>
    </div>
    {section === "materials" ? <MaterialImportForm subjects={content.subjectOptions} drafts={content.materialDrafts} materials={content.materials} status={status} /> : section === "accounts" ? <StudentAccountForm accounts={content.accounts} /> : <ContentManager section={section} content={content} />}
    <nav aria-label="Halaman daftar" className="flex flex-wrap items-center justify-between gap-3 border-t pt-5"><span className="text-sm text-muted-foreground">Halaman {page} · Maksimal 20 item per halaman</span><div className="flex gap-2">{page > 1 ? <Link className={buttonVariants({ variant: "outline" })} href={pageHref(page - 1)}>Sebelumnya</Link> : null}{content.hasNext ? <Link className={buttonVariants({ variant: "outline" })} href={pageHref(page + 1)}>Berikutnya</Link> : null}</div></nav>
  </section>;
}
