import { useTranslations } from "next-intl";
// src/components/activities/question-card.tsx

import { Field, FieldLegend, FieldSet, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuestionCard({
  question,
  answer,
  onAnswer,
  disabled = false,
}: {
  question: string;
  disabled?: boolean;

  answer: boolean | undefined;

  onAnswer: (value: boolean) => void;
}) {
  const t = useTranslations("UI");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{question}</CardTitle>
      </CardHeader>

      <CardContent>
        <FieldSet>
          <FieldLegend className="sr-only">{t("Pilih_Benar_atau_Salah")}</FieldLegend>
          <RadioGroup
            value={answer === undefined ? null : String(answer)}
            onValueChange={(value) => {
              if (value === "true") onAnswer(true);
              if (value === "false") onAnswer(false);
            }}
            disabled={disabled}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {[
              ["true", t("Benar")],
              ["false", t("Salah")],
            ].map(([value, label]) => (
              <FieldLabel
                key={value}
                className="min-h-11 cursor-pointer rounded-md border bg-card px-3 py-2 hover:bg-muted has-[[data-checked]]:border-primary has-[[data-checked]]:bg-muted"
              >
                <Field orientation="horizontal" className="items-center">
                  <RadioGroupItem value={value} />
                  <span>{label}</span>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </FieldSet>
      </CardContent>
    </Card>
  );
}
