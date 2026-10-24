import { useTranslations } from "next-intl";
import { provisionAccount, resetAccountPassword, updateAccount } from "@/lib/admin/actions";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Badge } from "@/components/ui/badge";
import { CollectionEmpty } from "@/components/layouts/collection-empty";
import { AdminField, ManagementForm, RecordEditor } from "./management-form";
import { AccountDeleteControls } from "./account-delete-controls";

export function StudentAccountForm({
  accounts,
}: {
  accounts: { id: string; name: string; email: string; role: string }[];
}) {
  const t = useTranslations("UI");

  return (
    <section className="page-stack">
      <RecordEditor
        title={t("Tambah_akun")}
        description={t("Akun_disediakan_oleh_administrator_Siswa_tidak_perlu_mendaftar_sendiri")}
        create
      >
        <ManagementForm action={provisionAccount} submitLabel={t("Buat_akun")} resetOnSuccess>
          <FieldGroup>
            <AdminField name="name" label={t("Nama")}>
              <Input required maxLength={120} autoComplete="name" />
            </AdminField>
            <AdminField name="email" label={t("Email")}>
              <Input type="email" required maxLength={254} autoComplete="email" />
            </AdminField>
            <AdminField
              name="password"
              label={t("Kata_sandi_sementara")}
              hint={t("Minimal_12_karakter_Berikan_melalui_saluran_yang_aman")}
            >
              <Input
                type="password"
                minLength={12}
                maxLength={128}
                required
                autoComplete="new-password"
              />
            </AdminField>
            <AdminField name="role" label={t("Peran")}>
              <NativeSelect defaultValue="student">
                <option value="student">{t("Siswa")}</option>
                <option value="teacher">{t("Guru")}</option>
              </NativeSelect>
            </AdminField>
          </FieldGroup>
        </ManagementForm>
      </RecordEditor>
      {accounts.length ? (
        <ul className="flex flex-col gap-3">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-words font-semibold">{account.name}</h3>
                  <Badge variant="secondary">
                    {{ admin: t("Admin"), teacher: t("Guru"), student: t("Siswa") }[account.role] ??
                      account.role}
                  </Badge>
                </div>
                <p className="break-all text-sm text-muted-foreground">{account.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {account.role === "student" || account.role === "teacher" ? (
                  <>
                    <RecordEditor
                      title={t("editAccount", { name: account.name })}
                      triggerLabel={t("Ubah_akun")}
                      description={t(
                        "Simpan_perubahan_nama_email_atau_peran_akun_Perubahan_email_atau_peran_akan_mengakhir",
                      )}
                    >
                      <ManagementForm action={updateAccount} submitLabel={t("Simpan_perubahan")}>
                        <FieldGroup>
                          <input type="hidden" name="userId" value={account.id} />
                          <AdminField name="name" label={t("Nama")}>
                            <Input
                              required
                              maxLength={120}
                              autoComplete="name"
                              defaultValue={account.name}
                            />
                          </AdminField>
                          <AdminField name="email" label={t("Email")}>
                            <Input
                              type="email"
                              required
                              maxLength={254}
                              autoComplete="email"
                              defaultValue={account.email}
                            />
                          </AdminField>
                          <AdminField name="role" label={t("Peran")}>
                            <NativeSelect required defaultValue={account.role}>
                              <option value="student">{t("Siswa")}</option>
                              <option value="teacher">{t("Guru")}</option>
                            </NativeSelect>
                          </AdminField>
                        </FieldGroup>
                      </ManagementForm>
                    </RecordEditor>
                    <AccountDeleteControls
                      id={account.id}
                      name={account.name}
                      email={account.email}
                    />
                  </>
                ) : (
                  <p className="max-w-prose text-sm text-muted-foreground">
                    {t("Akun_administrator_dilindungi_dari_perubahan_profil_peran_dan_penghapusan")}
                  </p>
                )}
                <RecordEditor
                  title={t("accountPassword", { name: account.name })}
                  triggerLabel={t("Ganti_kata_sandi")}
                  description={t(
                    "Mengganti_kata_sandi_akan_mengakhiri_semua_sesi_akun_ini_Pengguna_perlu_masuk_kembali",
                  )}
                >
                  <ManagementForm action={resetAccountPassword} submitLabel={t("Ganti_kata_sandi")}>
                    <FieldGroup>
                      <input type="hidden" name="userId" value={account.id} />
                      <AdminField
                        name="password"
                        label={t("Kata_sandi_sementara_baru")}
                        hint={t("Minimal_12_karakter")}
                      >
                        <Input
                          type="password"
                          minLength={12}
                          maxLength={128}
                          required
                          autoComplete="new-password"
                        />
                      </AdminField>
                    </FieldGroup>
                  </ManagementForm>
                </RecordEditor>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <CollectionEmpty
          title={t("Akun_tidak_ditemukan")}
          description={t("Tambahkan_akun_baru_atau_ubah_kata_pencarian")}
        />
      )}
    </section>
  );
}
