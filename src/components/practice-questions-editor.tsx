"use client"
import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import type { PracticeQuestion } from "@/lib/content-types"

type EditableQuestion = PracticeQuestion & { key: number }
const blank = (): PracticeQuestion => ({
  id: "", type: "MULTIPLE_CHOICE", prompt: "", promptPlain: "", translationId: "",
  options: ["", "", "", ""], correctAnswerIndex: 0, explanationJa: "", explanationId: "",
})

export function PracticeQuestionsEditor({ initial }: { initial: PracticeQuestion[] }) {
  const t = useTranslations("staff")
  const nextKey = useRef(Math.max(initial.length, 1))
  const [questions, setQuestions] = useState<EditableQuestion[]>(
    (initial.length ? initial : [blank()]).map((question, index) => ({ ...question, key: index })),
  )
  const inputClass = "mt-1 w-full rounded-md border bg-background px-3 py-2"
  return <div className="space-y-5">
    <input type="hidden" name="questionCount" value={questions.length} />
    {questions.map((question, index) => <fieldset key={question.key} className="space-y-4 rounded-lg border p-5"><legend className="px-2 font-semibold">{t("question", { number: index + 1 })}</legend>
      <label className="block text-sm font-medium">{t("questionType")}<select name={"type" + index} className={inputClass} value={question.type} onChange={(event) => setQuestions((items) => items.map((item) => item.key === question.key ? { ...item, type: event.target.value as PracticeQuestion["type"], correctAnswerIndex: 0 } : item))}><option value="MULTIPLE_CHOICE">{t("multipleChoice")}</option><option value="TRUE_FALSE">{t("trueFalse")}</option></select></label>
      <label className="block text-sm font-medium">{t("prompt")}<textarea name={"prompt" + index} className={inputClass} required maxLength={2000} rows={3} defaultValue={question.prompt} /></label>
      <label className="block text-sm font-medium">{t("translationId")}<textarea name={"translationId" + index} className={inputClass} required maxLength={2000} rows={2} defaultValue={question.translationId} /></label>
      {question.type === "MULTIPLE_CHOICE" && <div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((option) => <label key={option} className="block text-sm font-medium">{t("option", { letter: String.fromCharCode(65 + option) })}<input name={"option" + index + "_" + option} className={inputClass} required maxLength={500} defaultValue={question.options[option] ?? ""} /></label>)}</div>}
      <label className="block text-sm font-medium">{t("correct")}<select name={"correct" + index} className={inputClass} defaultValue={question.correctAnswerIndex}>{(question.type === "TRUE_FALSE" ? [t("true"), t("false")] : ["A", "B", "C", "D"]).map((label, option) => <option key={option} value={option}>{label}</option>)}</select></label>
      <label className="block text-sm font-medium">{t("explanationJa")}<textarea name={"explanationJa" + index} className={inputClass} required maxLength={2000} rows={2} defaultValue={question.explanationJa} /></label>
      <label className="block text-sm font-medium">{t("explanationId")}<textarea name={"explanationId" + index} className={inputClass} required maxLength={2000} rows={2} defaultValue={question.explanationId} /></label>
      {questions.length > 1 && <button type="button" onClick={() => setQuestions((items) => items.filter((item) => item.key !== question.key))} className="text-sm text-destructive">{t("removeQuestion")}</button>}
    </fieldset>)}
    <button type="button" disabled={questions.length >= 30} onClick={() => setQuestions((items) => [...items, { ...blank(), key: nextKey.current++ }])} className="rounded-md border px-4 py-2 text-sm">{t("addQuestion")}</button>
  </div>
}
