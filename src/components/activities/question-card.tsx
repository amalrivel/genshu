// src/components/activities/question-card.tsx

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function QuestionCard({
  question,
  answer,
  onAnswer,
  disabled = false,
}: {
  question: string;
  disabled?: boolean;

  answer:
    | boolean
    | undefined;

  onAnswer: (
    value: boolean,
  ) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {question}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            // NOTE: Warna saja tidak menyampaikan jawaban terpilih kepada
            // pembaca layar. aria-pressed menyatakan status pilihan; disabled
            // mencegah perubahan jawaban ketika server sedang menilai.
            aria-pressed={answer === true}
            disabled={disabled}
            variant={
              answer === true
                ? "default"
                : "outline"
            }
            onClick={() =>
              onAnswer(true)
            }
          >
            True
          </Button>

          <Button
            type="button"
            aria-pressed={answer === false}
            disabled={disabled}
            variant={
              answer === false
                ? "default"
                : "outline"
            }
            onClick={() =>
              onAnswer(false)
            }
          >
            False
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
