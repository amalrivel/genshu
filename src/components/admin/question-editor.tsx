"use client";
import { useTranslations } from "next-intl";

import { useId, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldSet,
  FieldLegend,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { useManagementField } from "./management-form";

type Question = { question: string; correctAnswer: boolean | null };
export function QuestionEditor({ initialQuestions = [] }: { initialQuestions?: Question[] }) {
  const t = useTranslations("UI");

  const prefix = useId();
  const nextId = useRef(initialQuestions.length || 1);
  const [rows, setRows] = useState(() =>
    (initialQuestions.length ? initialQuestions : [{ question: "", correctAnswer: null }]).map(
      (row, index) => ({ ...row, key: index }),
    ),
  );
  const { id, error, errorId, markDirty } = useManagementField("questions");
  function move(index: number, direction: number) {
    if (index + direction < 0 || index + direction >= rows.length) return;
    const changed = [...rows];
    [changed[index], changed[index + direction]] = [changed[index + direction], changed[index]];
    setRows(changed);
    markDirty();
    requestAnimationFrame(() =>
      document.getElementById(`${prefix}-${changed[index + direction].key}`)?.focus(),
    );
  }
  return (
    <FieldSet id={id} tabIndex={-1} aria-describedby={error ? errorId : undefined}>
      <FieldLegend>{t("Soal_dan_kunci_jawaban")}</FieldLegend>
      <FieldDescription>
        {t("Pilih_kunci_jawaban_untuk_setiap_pernyataan_Urutan_ini_akan_menjadi_urutan_latihan_si")}
      </FieldDescription>
      <input
        type="hidden"
        name="questions"
        value={JSON.stringify(
          rows.map(({ question, correctAnswer }) => ({ question, correctAnswer })),
        )}
      />
      <ol className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <li key={row.key} className="flex flex-col gap-4 rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">{t("questionSimple", { number: index + 1 })}</p>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={index === 0}
                  aria-label={t("moveQuestionUp", { number: index + 1 })}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={index === rows.length - 1}
                  aria-label={t("moveQuestionDown", { number: index + 1 })}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={t("removeQuestion", { number: index + 1 })}
                  onClick={() => {
                    setRows(rows.filter((item) => item.key !== row.key));
                    markDirty();
                  }}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`${prefix}-${row.key}`}>{t("Pernyataan")}</FieldLabel>
                <Textarea
                  id={`${prefix}-${row.key}`}
                  required
                  maxLength={1000}
                  rows={3}
                  value={row.question}
                  onChange={(event) => {
                    setRows(
                      rows.map((item) =>
                        item.key === row.key ? { ...item, question: event.target.value } : item,
                      ),
                    );
                    markDirty();
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${prefix}-answer-${row.key}`}>
                  {t("Kunci_jawaban249")}
                </FieldLabel>
                <NativeSelect
                  id={`${prefix}-answer-${row.key}`}
                  required
                  value={row.correctAnswer === null ? "" : String(row.correctAnswer)}
                  onChange={(event) => {
                    setRows(
                      rows.map((item) =>
                        item.key === row.key
                          ? { ...item, correctAnswer: event.target.value === "true" }
                          : item,
                      ),
                    );
                    markDirty();
                  }}
                >
                  <option value="" disabled>
                    {t("Pilih_kunci_jawaban")}
                  </option>
                  <option value="true">{t("Benar")}</option>
                  <option value="false">{t("Salah")}</option>
                </NativeSelect>
              </Field>
            </FieldGroup>
          </li>
        ))}
      </ol>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          setRows([...rows, { key: nextId.current++, question: "", correctAnswer: null }]);
          markDirty();
        }}
      >
        <Plus aria-hidden="true" data-icon="inline-start" />
        {t("Tambah_soal")}
      </Button>
    </FieldSet>
  );
}
