"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { NativeSelect } from "@/components/ui/native-select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { setLocale } from "@/i18n/actions";
import { isLocale } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Language");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <Field className="w-auto" data-invalid={failed}>
      <FieldLabel className="flex items-center gap-2">
        <Languages aria-hidden="true" className="size-4" />
        <span className="sr-only">{t("label")}</span>
        <NativeSelect
          aria-label={t("label")}
          aria-invalid={failed}
          aria-busy={pending}
          value={locale}
          disabled={pending}
          onChange={(event) => {
            const next = event.target.value;
            if (!isLocale(next)) return;
            setFailed(false);
            startTransition(async () => {
              try {
                await setLocale(next);
                router.refresh();
              } catch {
                setFailed(true);
              }
            });
          }}
        >
          <option value="id" lang="id">
            Bahasa Indonesia
          </option>
          <option value="ja" lang="ja">
            日本語
          </option>
        </NativeSelect>
      </FieldLabel>
      {failed ? <FieldError role="alert">{t("error")}</FieldError> : null}
    </Field>
  );
}
