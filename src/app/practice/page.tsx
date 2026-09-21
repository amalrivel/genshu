"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, CheckSquare, Plus, Search } from "lucide-react"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { useData } from "@/lib/data-context"
import { type PracticeQuestion } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

const TOPICS = ["語彙", "文法", "文化・マナー", "漢字"] as const
const LEVELS = ["N5", "N4", "N3"] as const

type PracticeTopic = (typeof TOPICS)[number]

const TOPIC_TRANSLATION_KEYS: Record<PracticeTopic, "topicVocab" | "topicGrammar" | "topicCulture" | "topicKanji"> = {
  "語彙": "topicVocab",
  "文法": "topicGrammar",
  "文化・マナー": "topicCulture",
  "漢字": "topicKanji",
}

type DraftQuestion = {
  prompt: string
  translationId: string
  options: string[]
  correctAnswerIndex: number
  explanationJa: string
  explanationId: string
}

const INITIAL_QUESTIONS: DraftQuestion[] = [
  {
    prompt: "<ruby>日本<rt>にほん</rt></ruby>へ（　　）行きます。",
    translationId: "Pergi ke Jepang pada bulan (...).",
    options: ["４月", "４日", "４時", "４年"],
    correctAnswerIndex: 0,
    explanationJa: "「４月（しがつ）」が自然です。月を表す表現です。",
    explanationId: "Pilihan '４月' (bulan April) paling tepat dalam konteks kalender.",
  },
]

export default function PracticePage() {
  const t = useTranslations("practice")
  const tCommon = useTranslations("common")
  const { practiceSets, cohorts, currentRole, addPracticeSet, getBestAttempt } = useData()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [levelFilter, setLevelFilter] = React.useState<(typeof LEVELS)[number] | "ALL">("ALL")
  const [topicFilter, setTopicFilter] = React.useState<PracticeTopic | "ALL">("ALL")
  const [cohortFilter, setCohortFilter] = React.useState("ALL")
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [formError, setFormError] = React.useState("")

  const [newTitle, setNewTitle] = React.useState("")
  const [newCohortId, setNewCohortId] = React.useState("cohort-1")
  const [newTargetLevel, setNewTargetLevel] = React.useState<(typeof LEVELS)[number]>("N5")
  const [newTopic, setNewTopic] = React.useState<PracticeTopic>("語彙")
  const [newDescription, setNewDescription] = React.useState("")
  const [newPassScore, setNewPassScore] = React.useState(70)
  const [questions, setQuestions] = React.useState<DraftQuestion[]>(INITIAL_QUESTIONS)

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const practiceSummaries = practiceSets.map((set) => ({ set, bestAttempt: getBestAttempt(set.id) }))
  const filteredSets = practiceSummaries.filter(({ set }) => {
    const matchesSearch =
      !normalizedSearch ||
      set.title.toLowerCase().includes(normalizedSearch) ||
      set.description.toLowerCase().includes(normalizedSearch)
    const matchesLevel = levelFilter === "ALL" || set.targetLevel === levelFilter
    const matchesTopic = topicFilter === "ALL" || set.topic === topicFilter
    const matchesCohort = cohortFilter === "ALL" || set.cohortId === "all" || set.cohortId === cohortFilter
    return matchesSearch && matchesLevel && matchesTopic && matchesCohort
  })
  const hasActiveFilters = Boolean(normalizedSearch) || levelFilter !== "ALL" || topicFilter !== "ALL" || cohortFilter !== "ALL"

  const attemptedSets = practiceSummaries.filter(({ bestAttempt }) => bestAttempt)
  const passedSets = attemptedSets.filter(({ set, bestAttempt }) =>
    bestAttempt ? (bestAttempt.score / bestAttempt.totalQuestions) * 100 >= set.passScore : false
  )
  const averageBestScore = attemptedSets.length
    ? Math.round(
        attemptedSets.reduce((total, { bestAttempt }) => total + (bestAttempt!.score / bestAttempt!.totalQuestions) * 100, 0) /
          attemptedSets.length
      )
    : null
  const totalQuestions = practiceSets.reduce((total, set) => total + set.questions.length, 0)
  const topicCount = new Set(practiceSets.map((set) => set.topic)).size
  const averagePassScore = practiceSets.length
    ? Math.round(practiceSets.reduce((total, set) => total + set.passScore, 0) / practiceSets.length)
    : null

  const resetFilters = () => {
    setSearchQuery("")
    setLevelFilter("ALL")
    setTopicFilter("ALL")
    setCohortFilter("ALL")
  }

  const openCreateDialog = () => {
    setFormError("")
    setCreateDialogOpen(true)
  }

  const handleAddQuestionField = () => {
    setQuestions((previous) => [
      ...previous,
      {
        prompt: "",
        translationId: "",
        options: ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
        correctAnswerIndex: 0,
        explanationJa: "",
        explanationId: "",
      },
    ])
  }

  const updateQuestion = (questionIndex: number, updates: Partial<DraftQuestion>) => {
    setQuestions((previous) => previous.map((question, index) => (index === questionIndex ? { ...question, ...updates } : question)))
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((previous) =>
      previous.map((question, index) => {
        if (index !== questionIndex) return question
        const options = [...question.options]
        options[optionIndex] = value
        return { ...question, options }
      })
    )
  }

  const handleCreateSet = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newTitle.trim()) {
      setFormError(t("titleRequired"))
      return
    }

    const formattedQuestions: PracticeQuestion[] = questions.map((question, index) => ({
      id: `custom-q-${Date.now()}-${index}`,
      type: "MULTIPLE_CHOICE",
      prompt: question.prompt.trim() || `問題 ${index + 1}`,
      promptPlain: question.prompt.replace(/<[^>]*>/g, ""),
      translationId: question.translationId.trim() || "Terjemahan latihan",
      options: question.options.filter((option) => option.trim().length > 0),
      correctAnswerIndex: question.correctAnswerIndex,
      explanationJa: question.explanationJa.trim() || "解説が登録されていません。",
      explanationId: question.explanationId.trim() || "Belum ada penjelasan.",
    }))

    addPracticeSet({
      title: newTitle.trim(),
      cohortId: newCohortId,
      targetLevel: newTargetLevel,
      topic: newTopic,
      description: newDescription.trim() || "練習問題ドリル",
      passScore: Number(newPassScore),
      questions: formattedQuestions,
    })

    setCreateDialogOpen(false)
    setNewTitle("")
    setNewDescription("")
    setFormError("")
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow={<Badge variant="outline">{t("badge")}</Badge>}
        title={t("title")}
        description={t("desc")}
        action={
          canManage ? (
            <Button type="button" onClick={openCreateDialog} className="gap-2">
              <Plus aria-hidden="true" className="size-4" />
              {t("createSet")}
            </Button>
          ) : (
            <Badge variant="roleGakusei">{tCommon("roleGakusei")}</Badge>
          )
        }
      />

      <section aria-labelledby="practice-metrics-title">
        <h2 id="practice-metrics-title" className="sr-only">{t("metricsLabel")}</h2>
        <div className="metric-strip">
          {canManage ? (
            <>
              <div className="metric-item"><p className="metric-label">{t("metricSets")}</p><p className="metric-value">{practiceSets.length}</p><p className="metric-note">{t("metricSetsNote")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("metricQuestions")}</p><p className="metric-value">{totalQuestions}</p><p className="metric-note">{t("metricQuestionsNote")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("metricTopics")}</p><p className="metric-value">{topicCount}/{TOPICS.length}</p><p className="metric-note">{t("metricTopicsNote")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("metricPassScore")}</p><p className="metric-value">{averagePassScore === null ? "—" : `${averagePassScore}%`}</p><p className="metric-note">{t("metricPassScoreNote")}</p></div>
            </>
          ) : (
            <>
              <div className="metric-item"><p className="metric-label">{t("metricAvailable")}</p><p className="metric-value">{practiceSets.length}</p><p className="metric-note">{t("metricAvailableNote")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("metricAttempted")}</p><p className="metric-value">{attemptedSets.length}/{practiceSets.length}</p><p className="metric-note">{t("metricAttemptedNote")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("metricPassed")}</p><p className="metric-value">{passedSets.length}</p><p className="metric-note">{t("metricPassedNote")}</p></div>
              <div className="metric-item"><p className="metric-label">{t("metricBestScore")}</p><p className="metric-value">{averageBestScore === null ? "—" : `${averageBestScore}%`}</p><p className="metric-note">{t("metricBestScoreNote")}</p></div>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="practice-list-title" className="space-y-4">
        <SectionHeader
          title={<span id="practice-list-title">{t("listTitle")}</span>}
          description={<span aria-live="polite">{t("resultsSummary", { shown: filteredSets.length, total: practiceSets.length })}</span>}
        />

        <div className="filter-toolbar">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" aria-label={t("searchPlaceholder")} placeholder={t("searchPlaceholder")} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="bg-card pl-9" />
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <label htmlFor="practice-cohort-filter" className="shrink-0 text-xs font-medium text-muted-foreground">{t("filterCohort")}</label>
            <select id="practice-cohort-filter" value={cohortFilter} onChange={(event) => setCohortFilter(event.target.value)} className="h-10 min-w-0 rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="ALL">{t("allCohorts")}</option>
              {cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.code} — {cohort.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/40 pt-3">
          <div role="group" aria-label={t("filterLevel")} className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-lg border border-border/60 bg-muted/50 p-1">
            <span className="ml-2 mr-1 shrink-0 text-xs font-medium text-muted-foreground">{t("filterLevel")}</span>
            <button type="button" aria-pressed={levelFilter === "ALL"} onClick={() => setLevelFilter("ALL")} className={cn("min-h-9 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60", levelFilter === "ALL" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}>{t("allLevels")}</button>
            {LEVELS.map((level) => <button key={level} type="button" aria-pressed={levelFilter === level} onClick={() => setLevelFilter(level)} className={cn("min-h-9 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60", levelFilter === level ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}>{level}</button>)}
          </div>
          <div role="group" aria-label={t("filterTopic")} className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-lg border border-border/60 bg-muted/50 p-1">
            <span className="ml-2 mr-1 shrink-0 text-xs font-medium text-muted-foreground">{t("filterTopic")}</span>
            <button type="button" aria-pressed={topicFilter === "ALL"} onClick={() => setTopicFilter("ALL")} className={cn("min-h-9 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60", topicFilter === "ALL" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}>{t("allTopics")}</button>
            {TOPICS.map((topic) => <button key={topic} type="button" aria-pressed={topicFilter === topic} onClick={() => setTopicFilter(topic)} className={cn("min-h-9 shrink-0 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60", topicFilter === topic ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}>{t(TOPIC_TRANSLATION_KEYS[topic])}</button>)}
          </div>
        </div>

        {filteredSets.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="size-5" />}
            title={hasActiveFilters ? t("noSetsFound") : t("noSetsEmpty")}
            description={hasActiveFilters ? t("noSetsDesc") : t("noSetsEmptyDesc")}
            action={hasActiveFilters ? <Button type="button" variant="outline" onClick={resetFilters}>{t("resetFilters")}</Button> : canManage ? <Button type="button" onClick={openCreateDialog} className="gap-2"><Plus aria-hidden="true" className="size-4" />{t("createSet")}</Button> : undefined}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSets.map(({ set, bestAttempt }) => {
              const targetCohort = cohorts.find((cohort) => cohort.id === set.cohortId)
              const bestScore = bestAttempt ? Math.round((bestAttempt.score / bestAttempt.totalQuestions) * 100) : null
              return (
                <li key={set.id} className="min-w-0">
                  <Link href={`/practice/${set.id}`} aria-label={t("openPracticeFor", { title: set.title })} className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2">
                    <Card className="flex h-full flex-col border-border/80 transition-colors group-hover:border-primary/40 group-hover:shadow-md">
                      <CardHeader className="space-y-3 p-5 pb-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5"><Badge variant="outline" className="font-mono text-xs">{set.targetLevel}</Badge><Badge variant="secondary" className="text-xs">{t(TOPIC_TRANSLATION_KEYS[set.topic])}</Badge></div>
                          {bestScore === null ? <Badge variant="outline" className="text-xs">{t("notAttempted")}</Badge> : <Badge variant={bestScore >= set.passScore ? "success" : "warning"} className="gap-1 text-xs"><CheckCircle2 aria-hidden="true" className="size-3" />{t("bestScore")} {bestScore}%</Badge>}
                        </div>
                        <div><CardTitle className="text-base transition-colors group-hover:text-primary sm:text-lg">{set.title}</CardTitle><CardDescription className="mt-2 line-clamp-2 text-xs">{set.description}</CardDescription></div>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-4 p-5 pt-0">
                        <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/40 bg-muted/40 p-3 text-xs text-muted-foreground">
                          <span><span className="block text-[0.7rem]">{t("questionCount")}</span><strong className="mt-0.5 block text-sm text-foreground">{set.questions.length}</strong></span>
                          <span><span className="block text-[0.7rem]">{t("passCriteria")}</span><strong className="mt-0.5 block text-sm text-foreground">{set.passScore}%</strong></span>
                          <span><span className="block text-[0.7rem]">{t("filterCohort")}</span><strong className="mt-0.5 block truncate font-mono text-sm text-foreground">{set.cohortId === "all" ? tCommon("all") : targetCohort?.code ?? t("unknownCohort")}</strong></span>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-3"><time dateTime={set.createdAt} className="text-xs text-muted-foreground">{set.createdAt}</time><span className="inline-flex min-h-9 items-center gap-1.5 text-sm font-medium text-primary">{bestAttempt ? t("retakePractice") : t("startPractice")}<ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" /></span></div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Dialog open={createDialogOpen} onOpenChange={(open) => { setCreateDialogOpen(open); if (!open) setFormError("") }}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto" closeLabel={tCommon("close")}>
          <DialogHeader><DialogTitle>{t("modalTitle")}</DialogTitle><DialogDescription>{t("modalDesc")}</DialogDescription></DialogHeader>
          <form onSubmit={handleCreateSet} className="space-y-4 text-sm">
            {formError && <p role="alert" aria-live="polite" className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}
            <div><label htmlFor="practice-create-title" className="mb-1 block text-xs font-medium">{t("modalFieldTitle")}</label><Input id="practice-create-title" name="title" placeholder={t("titlePlaceholder")} value={newTitle} onChange={(event) => { setNewTitle(event.target.value); if (formError) setFormError("") }} required /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div><label htmlFor="practice-create-level" className="mb-1 block text-xs font-medium">{t("modalFieldLevel")}</label><select id="practice-create-level" name="level" value={newTargetLevel} onChange={(event) => setNewTargetLevel(event.target.value as (typeof LEVELS)[number])} className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}</select></div>
              <div><label htmlFor="practice-create-topic" className="mb-1 block text-xs font-medium">{t("modalFieldTopic")}</label><select id="practice-create-topic" name="topic" value={newTopic} onChange={(event) => setNewTopic(event.target.value as PracticeTopic)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{TOPICS.map((topic) => <option key={topic} value={topic}>{t(TOPIC_TRANSLATION_KEYS[topic])}</option>)}</select></div>
              <div><label htmlFor="practice-create-cohort" className="mb-1 block text-xs font-medium">{t("modalFieldCohort")}</label><select id="practice-create-cohort" name="cohort" value={newCohortId} onChange={(event) => setNewCohortId(event.target.value)} className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="all">{t("allCohorts")}</option>{cohorts.map((cohort) => <option key={cohort.id} value={cohort.id}>{cohort.code} — {cohort.name}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="sm:col-span-2"><label htmlFor="practice-create-description" className="mb-1 block text-xs font-medium">{t("modalFieldDesc")}</label><Input id="practice-create-description" name="description" placeholder={t("descriptionPlaceholder")} value={newDescription} onChange={(event) => setNewDescription(event.target.value)} /></div><div><label htmlFor="practice-create-pass-score" className="mb-1 block text-xs font-medium">{t("modalFieldPassScore")}</label><Input id="practice-create-pass-score" name="passScore" type="number" min={50} max={100} value={newPassScore} onChange={(event) => setNewPassScore(Number(event.target.value))} /></div></div>
            <fieldset className="space-y-3 border-t border-border pt-4">
              <legend className="sr-only">{t("questionsLegend")}</legend>
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold">{t("questionsCount", { count: questions.length })}</p><Button type="button" variant="outline" size="xs" onClick={handleAddQuestionField} className="gap-1 text-xs"><Plus aria-hidden="true" className="size-3" />{t("addQuestion")}</Button></div>
              {questions.map((question, questionIndex) => (
                <fieldset key={questionIndex} className="space-y-3 rounded-lg border border-border bg-muted/20 p-3.5">
                  <legend className="px-1 text-xs font-semibold text-primary">{t("questionNumber", { number: questionIndex + 1 })}</legend>
                  <div><label htmlFor={`practice-question-${questionIndex}-prompt`} className="mb-1 block text-xs text-muted-foreground">{t("questionPrompt")}</label><Input id={`practice-question-${questionIndex}-prompt`} name={`question-${questionIndex}-prompt`} placeholder={t("questionPromptPlaceholder")} value={question.prompt} onChange={(event) => updateQuestion(questionIndex, { prompt: event.target.value })} required /></div>
                  <div><label htmlFor={`practice-question-${questionIndex}-translation`} className="mb-1 block text-xs text-muted-foreground">{t("questionTranslation")}</label><Input id={`practice-question-${questionIndex}-translation`} name={`question-${questionIndex}-translation`} placeholder={t("questionTranslationPlaceholder")} value={question.translationId} onChange={(event) => updateQuestion(questionIndex, { translationId: event.target.value })} /></div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <div key={optionIndex}><label htmlFor={`practice-question-${questionIndex}-option-${optionIndex}`} className="mb-1 block text-xs text-muted-foreground">{t("optionLabel", { number: optionIndex + 1 })}{question.correctAnswerIndex === optionIndex ? ` ${t("correctOption")}` : ""}</label><Input id={`practice-question-${questionIndex}-option-${optionIndex}`} name={`question-${questionIndex}-option-${optionIndex}`} value={option} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} className={question.correctAnswerIndex === optionIndex ? "border-emerald-500/60" : undefined} /></div>)}</div>
                  <div className="flex flex-wrap items-center gap-2"><label htmlFor={`practice-question-${questionIndex}-correct-answer`} className="text-xs text-muted-foreground">{t("correctAnswer")}</label><select id={`practice-question-${questionIndex}-correct-answer`} name={`question-${questionIndex}-correct-answer`} value={question.correctAnswerIndex} onChange={(event) => updateQuestion(questionIndex, { correctAnswerIndex: Number(event.target.value) })} className="h-9 rounded border border-input bg-card px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{question.options.map((_, optionIndex) => <option key={optionIndex} value={optionIndex}>{t("optionLabel", { number: optionIndex + 1 })}</option>)}</select></div>
                  <div><label htmlFor={`practice-question-${questionIndex}-explanation`} className="mb-1 block text-xs text-muted-foreground">{t("questionExplanation")}</label><Input id={`practice-question-${questionIndex}-explanation`} name={`question-${questionIndex}-explanation`} placeholder={t("questionExplanationPlaceholder")} value={question.explanationJa} onChange={(event) => updateQuestion(questionIndex, { explanationJa: event.target.value })} /></div>
                </fieldset>
              ))}
            </fieldset>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>{tCommon("cancel")}</Button><Button type="submit">{t("modalSubmit")}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
