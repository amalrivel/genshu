import { getTranslations } from "next-intl/server";
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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("UI");
  return {
    title: t("Pengelolaan"),
    description: t("Kelola_latihan_kabar_kelas_dan_akun_Genshu"),
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; q?: string; page?: string; status?: string }>;
}) {
  const t = await getTranslations("UI");

  const session = await requireManagement();
  const role = (session.user as typeof session.user & { role?: string }).role;
  const { section, q, page, status } = managementParams(await searchParams);
  const content = await getManagementContent(section, q, page, status);
  const pageHref = (number: number) =>
    `/admin?${new URLSearchParams({ section, q, ...(section === "materials" ? { status } : {}), page: String(number) })}`;
  return (
    <section className="page-stack">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin" />}>{t("Pengelolaan")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t(managementSections[section])}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <header className="page-header">
        <h1>{t(managementSections[section])}</h1>
        <p>
          {section === "accounts"
            ? t("Kelola_profil_peran_dan_akses_akun_Perubahan_akun_langsung_berlaku")
            : section === "materials"
              ? t(
                  "Temukan_materi_yang_sudah_terbit_atau_tinjau_draft_hasil_impor_Materi_terbit_tersedia",
                )
              : t("Simpan_perubahan_sebagai_draft_tinjau_lalu_terbitkan")}
        </p>
      </header>
      <nav aria-label={t("Bagian_pengelolaan")} className="flex flex-wrap gap-2">
        {Object.entries(managementSections)
          .filter(
            ([key]) =>
              !["materials", "topics", "subjects", "events"].includes(key) &&
              (key !== "accounts" || role === "admin"),
          )
          .map(([key, label]) => (
            <Link
              key={key}
              href={`/admin?section=${key}`}
              aria-current={key === section ? "page" : undefined}
              className={buttonVariants({ variant: key === section ? "default" : "outline" })}
            >
              {t(label)}
            </Link>
          ))}
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-4">
        {section === "materials" ? (
          <nav aria-label={t("Status_materi")} className="flex gap-2">
            {(
              [
                ["published", "Materi_terbit"],
                ["draft", "Draft"],
              ] as const
            ).map(([value, label]) => (
              <Link
                key={value}
                href={`/admin?${new URLSearchParams({ section, status: value, q })}`}
                aria-current={status === value ? "page" : undefined}
                className={buttonVariants({ variant: status === value ? "secondary" : "ghost" })}
              >
                {t(label)}
              </Link>
            ))}
          </nav>
        ) : (
          <h2 className="sr-only">{t("listTitle", { section: t(managementSections[section]) })}</h2>
        )}
        <Form
          action="/admin"
          scroll={false}
          className="flex w-full min-w-0 items-end gap-2 sm:max-w-sm"
        >
          <input type="hidden" name="section" value={section} />
          {section === "materials" ? <input type="hidden" name="status" value={status} /> : null}
          <Field>
            <FieldLabel htmlFor="management-search">
              {section === "accounts" ? t("Cari_nama_atau_email") : t("Cari_judul")}
            </FieldLabel>
            <Input
              key={`${section}-${status}-${q}`}
              id="management-search"
              name="q"
              type="search"
              defaultValue={q}
              maxLength={120}
            />
          </Field>
          <PendingSubmitButton variant="outline" pendingLabel={t("Mencari")}>
            <Search aria-hidden="true" data-icon="inline-start" />
            {t("Cari")}
          </PendingSubmitButton>
        </Form>
      </div>
      {section === "materials" ? (
        <MaterialImportForm
          subjects={content.subjectOptions}
          drafts={content.materialDrafts}
          materials={content.materials}
          status={status}
        />
      ) : section === "accounts" ? (
        <StudentAccountForm accounts={content.accounts} />
      ) : (
        <ContentManager section={section} content={content} />
      )}
      <nav
        aria-label={t("Halaman_daftar")}
        className="flex flex-wrap items-center justify-between gap-3 border-t pt-5"
      >
        <span className="text-sm text-muted-foreground">{t("pageSummary", { page })}</span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link className={buttonVariants({ variant: "outline" })} href={pageHref(page - 1)}>
              {t("Sebelumnya")}
            </Link>
          ) : null}
          {content.hasNext ? (
            <Link className={buttonVariants({ variant: "outline" })} href={pageHref(page + 1)}>
              {t("Berikutnya")}
            </Link>
          ) : null}
        </div>
      </nav>
    </section>
  );
}
