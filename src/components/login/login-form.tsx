"use client";
import { LanguageSwitcher } from "@/components/layouts/language-switcher";
import { useTranslations } from "next-intl";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { createAuthClient } from "better-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

const authClient = createAuthClient();

export function LoginForm({
  demoAccounts,
}: {
  demoAccounts?: { users: { email: string; name: string }[]; password: string };
}) {
  const t = useTranslations("UI");

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  async function signIn(formData: FormData) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await authClient.signIn.email({
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      });
      if (result.error) {
        setError(t("Email_atau_kata_sandi_belum_sesuai_Periksa_kembali_lalu_coba_lagi"));
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setError(t("Belum_berhasil_masuk_Periksa_koneksi_Anda_dan_coba_lagi"));
    } finally {
      setPending(false);
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-xl bg-primary text-xl font-semibold text-primary-foreground"
        >
          源
        </span>
        <span className="text-xl font-semibold tracking-tight">Genshu</span>
      </div>
      <div className="self-end">
        <LanguageSwitcher />
      </div>
      <Card>
        <CardHeader>
          <h1>{t("Selamat_datang_kembali")}</h1>
          <CardDescription>
            {t("Masuk_dan_lanjutkan_perjalanan_belajar_bahasa_Jepang_Anda")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signIn} aria-busy={pending}>
            <FieldGroup>
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="email">{t("Email")}</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError(null);
                  }}
                  required
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                />
              </Field>
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="password">{t("Kata_sandi")}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={visible ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError(null);
                    }}
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? "login-error" : undefined}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-sm"
                      aria-label={visible ? t("Sembunyikan_kata_sandi") : t("Tampilkan_kata_sandi")}
                      aria-pressed={visible}
                      onClick={() => setVisible(!visible)}
                    >
                      {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              {error ? (
                <div ref={errorRef} tabIndex={-1}>
                  <Alert variant="destructive" id="login-error">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              ) : null}
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <>
                      <Spinner aria-hidden="true" />
                      {t("Sedang_masuk")}
                    </>
                  ) : (
                    <>
                      {t("Masuk")}
                      <ArrowRight aria-hidden="true" data-icon="inline-end" />
                    </>
                  )}
                </Button>
                <FieldDescription>
                  {t(
                    "Gunakan_akun_dari_administrator_Untuk_bantuan_akun_atau_kata_sandi_hubungi_administra",
                  )}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      {demoAccounts ? (
        <details className="rounded-xl border p-4">
          <summary className="flex min-h-11 items-center text-sm font-medium">
            {t("Akun_pengujian")}
          </summary>
          <fieldset className="flex flex-col gap-3 pt-3" disabled={pending}>
            <legend className="sr-only">{t("Pilih_akun_demo")}</legend>
            <p className="text-sm text-muted-foreground">
              {t(
                "Pilih_akun_untuk_mengisi_formulir_lalu_tekan_Masuk_Data_demo_harus_sudah_tersedia",
              )}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {demoAccounts.users.map((user) => (
                <Button
                  key={user.email}
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setEmail(user.email);
                    setPassword(demoAccounts.password);
                    setError(null);
                  }}
                >
                  {user.name}
                </Button>
              ))}
            </div>
          </fieldset>
        </details>
      ) : null}
    </div>
  );
}
