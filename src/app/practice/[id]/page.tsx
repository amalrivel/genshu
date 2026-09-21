"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Languages,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FuriganaText } from "@/components/ui/furigana-text"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader, PageShell, SectionHeader } from "@/components/layout/page-frame"
import { useData } from "@/lib/data-context"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"

export default function PracticePlayerPage() {
  const t = useTranslations("practicePlayer")
  const tNav = useTranslations("nav")
  const params = useParams()
  const practiceId = params.id as string

  const { practiceSets, saveAttempt, cohorts } = useData()
  const practiceSet = practiceSets.find((p) => p.id === practiceId)
  const cohort = cohorts.find((c) => c.id === practiceSet?.cohortId)

  // Quiz player state
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null)
  const [isAnswerConfirmed, setIsAnswerConfirmed] = React.useState(false)
  const [answers, setAnswers] = React.useState<Record<string, number>>({})
  const [isFinished, setIsFinished] = React.useState(false)

  // Furigana & Translation controls
  const [showFurigana, setShowFurigana] = React.useState(true)
  const [showTranslation, setShowTranslation] = React.useState(false)

  // Results review filter
  const [reviewFilter, setReviewFilter] = React.useState<"all" | "incorrect">("all")

  const handleConfirmAnswer = React.useCallback(() => {
    if (!practiceSet || selectedOption === null) return
    const q = practiceSet.questions[currentIndex]
    if (!q) return
    setIsAnswerConfirmed(true)
    setAnswers((prev) => ({
      ...prev,
      [q.id]: selectedOption,
    }))
  }, [practiceSet, currentIndex, selectedOption])

  const handleNextQuestion = React.useCallback(() => {
    if (!practiceSet) return
    const total = practiceSet.questions.length
    if (currentIndex + 1 < total) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsAnswerConfirmed(false)
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } else {
      const q = practiceSet.questions[currentIndex]
      const finalAnswers = {
        ...answers,
        ...(q ? { [q.id]: selectedOption! } : {}),
      }
      const finalCorrectCount = practiceSet.questions.filter(
        (item) => finalAnswers[item.id] === item.correctAnswerIndex
      ).length
      saveAttempt(practiceSet.id, finalCorrectCount, total, finalAnswers)
      setIsFinished(true)
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }, [practiceSet, currentIndex, answers, selectedOption, saveAttempt])

  const handleRestartQuiz = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswerConfirmed(false)
    setAnswers({})
    setIsFinished(false)
    setReviewFilter("all")
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Keyboard navigation shortcuts: 1-4 / A-D to select, Enter to Confirm / Next
  React.useEffect(() => {
    if (isFinished || !practiceSet) return
    const currentQ = practiceSet.questions[currentIndex]
    if (!currentQ) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focusing input elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      if (!isAnswerConfirmed) {
        // Keys 1-4 or A-D to select option
        const key = e.key.toUpperCase()
        let optionIndex = -1
        if (key >= "1" && key <= "4") {
          optionIndex = parseInt(key, 10) - 1
        } else if (key === "A") optionIndex = 0
        else if (key === "B") optionIndex = 1
        else if (key === "C") optionIndex = 2
        else if (key === "D") optionIndex = 3

        if (optionIndex >= 0 && optionIndex < currentQ.options.length) {
          e.preventDefault()
          setSelectedOption(optionIndex)
        } else if (e.key === "Enter" && selectedOption !== null) {
          e.preventDefault()
          handleConfirmAnswer()
        }
      } else {
        // When answer is confirmed, Enter advances to next question
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleNextQuestion()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    isFinished,
    practiceSet,
    currentIndex,
    isAnswerConfirmed,
    selectedOption,
    handleConfirmAnswer,
    handleNextQuestion,
  ])

  if (!practiceSet) {
    return (
      <PageShell>
        <EmptyState
          icon={<AlertCircle className="size-5" />}
          title={t("notFoundTitle")}
          description={t("notFoundDesc")}
          action={
            <Link href="/practice">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="size-4" />
                {t("backToList")}
              </Button>
            </Link>
          }
        />
      </PageShell>
    )
  }

  const currentQuestion = practiceSet.questions[currentIndex]
  const totalQuestions = practiceSet.questions.length
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100)

  // Check correctness of confirmed answer
  const isCurrentCorrect =
    selectedOption !== null &&
    selectedOption === currentQuestion.correctAnswerIndex

  // Calculate final score
  const correctCount = practiceSet.questions.filter(
    (q) => answers[q.id] === q.correctAnswerIndex
  ).length
  const scorePercent = Math.round((correctCount / totalQuestions) * 100)
  const isPassed = scorePercent >= practiceSet.passScore

  // Filtered review questions
  const reviewQuestions = practiceSet.questions.filter((q) => {
    if (reviewFilter === "incorrect") {
      return answers[q.id] !== q.correctAnswerIndex
    }
    return true
  })

  return (
    <PageShell className={cn("max-w-4xl", !isFinished && "pb-28 sm:pb-32")}>
      <Breadcrumbs
        items={[
          { label: tNav("practice"), href: "/practice" },
          { label: practiceSet.title },
        ]}
      />

      <PageHeader
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[0.7rem]">
              {practiceSet.targetLevel}
            </Badge>
            {practiceSet.cohortId && practiceSet.cohortId !== "all" && cohort && (
              <Link href={`/cohorts/${cohort.id}`}>
                <Badge
                  variant="secondary"
                  className="font-mono text-[0.7rem] hover:bg-secondary/80 cursor-pointer"
                >
                  {cohort.code}
                </Badge>
              </Link>
            )}
          </span>
        }
        title={practiceSet.title}
        description={practiceSet.description || undefined}
        metadata={
          <>
            <span>{t("topicLabel", { topic: practiceSet.topic })}</span>
            {!isFinished && (
              <span className="font-semibold text-primary">
                {t("questionProgress", { current: currentIndex + 1, total: totalQuestions })}
              </span>
            )}
          </>
        }
        action={
          <div className="flex items-center gap-2">
            {/* Furigana Toggle */}
            <Button
              variant={showFurigana ? "secondary" : "outline"}
              size="xs"
              aria-pressed={showFurigana}
              onClick={() => setShowFurigana(!showFurigana)}
              className="text-xs gap-1.5 h-8"
              title={t("furiganaTooltip")}
            >
              {showFurigana ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>{t("furiganaToggle", { status: showFurigana ? t("on") : t("off") })}</span>
            </Button>

            {/* Translation Toggle */}
            <Button
              variant={showTranslation ? "secondary" : "outline"}
              size="xs"
              aria-pressed={showTranslation}
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-xs gap-1.5 h-8"
              title={t("translationTooltip")}
            >
              <Languages className="h-3.5 w-3.5" />
              <span>{t("translationToggle", { status: showTranslation ? t("shown") : t("hidden") })}</span>
            </Button>
          </div>
        }
      />

      {/* QUIZ VIEW (When not finished) */}
      {!isFinished ? (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Main Question Card */}
          <Card className="border-border/80 shadow-md">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary" className="text-xs">
                  {currentQuestion.type === "TRUE_FALSE" ? t("typeTrueFalse") : t("typeMultipleChoice")}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {t("topicLabel", { topic: practiceSet.topic })}
                </span>
              </div>

              {/* Japanese Prompt with Furigana */}
              <div className="text-lg sm:text-xl font-medium leading-loose text-foreground">
                <FuriganaText
                  html={currentQuestion.prompt}
                  showFurigana={showFurigana}
                />
              </div>

              {/* Optional Indonesian Translation */}
              {showTranslation && currentQuestion.translationId && (
                <div className="rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground border border-border/50 animate-in fade-in-50 mt-2">
                  <span className="font-semibold text-foreground/80">{t("translationPrefix")} </span>
                  {currentQuestion.translationId}
                </div>
              )}
            </CardHeader>

            {/* Options List */}
            <CardContent className="p-6 pt-2 space-y-3">
              <div className="grid grid-cols-1 gap-2.5">
                {currentQuestion.options.map((optionText, idx) => {
                  const isSelected = selectedOption === idx
                  const isCorrect = idx === currentQuestion.correctAnswerIndex

                  let optionStyle = "border-border/80 bg-card hover:bg-muted/40 text-foreground"

                  if (isAnswerConfirmed) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 ring-2 ring-emerald-500/30"
                    } else if (isSelected) {
                      optionStyle = "border-destructive bg-destructive/10 text-destructive dark:bg-destructive/20 ring-2 ring-destructive/30"
                    } else {
                      optionStyle = "border-border/40 opacity-60"
                    }
                  } else if (isSelected) {
                    optionStyle = "border-primary bg-primary/10 text-primary ring-2 ring-primary/40 font-medium"
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerConfirmed}
                      onClick={() => setSelectedOption(idx)}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer disabled:cursor-default",
                        optionStyle
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 border",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground bg-muted/30"
                          )}
                        >
                          {currentQuestion.type === "TRUE_FALSE" ? (idx === 0 ? "○" : "×") : String.fromCharCode(65 + idx)}
                        </span>
                        <span>{optionText}</span>
                      </div>

                      {/* Right indicator: Keyboard shortcut hint or Revealed Status Icon */}
                      <div className="flex items-center gap-2">
                        {!isAnswerConfirmed && (
                          <span className="hidden sm:inline-block text-[0.68rem] text-muted-foreground/60 border border-border/60 rounded px-1.5 py-0.5 font-mono">
                            {idx + 1}
                          </span>
                        )}
                        {isAnswerConfirmed && (
                          <div>
                            {isCorrect && (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            )}
                            {!isCorrect && isSelected && (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Revealed Explanation Panel */}
              {isAnswerConfirmed && (
                <div className="rounded-xl border border-border/80 bg-muted/30 p-4 sm:p-5 space-y-3 animate-in fade-in-50 mt-4">
                  <div className="flex items-center gap-2">
                    {isCurrentCorrect ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-sm sm:text-base">
                        <CheckCircle2 className="h-5 w-5" />
                        {t("correctNotice")}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-destructive font-bold text-sm sm:text-base">
                        <XCircle className="h-5 w-5" />
                        {t("incorrectNotice", {
                          answer:
                            currentQuestion.type === "TRUE_FALSE"
                              ? currentQuestion.correctAnswerIndex === 0
                                ? "○"
                                : "×"
                              : String.fromCharCode(65 + currentQuestion.correctAnswerIndex),
                        })}
                      </div>
                    )}
                  </div>

                  {/* Japanese & Indonesian Explanation */}
                  <div className="text-xs sm:text-sm leading-relaxed text-foreground space-y-1">
                    <p className="font-semibold text-muted-foreground text-xs">{t("explanationLabel")}</p>
                    <p>{currentQuestion.explanationJa}</p>
                    {currentQuestion.explanationId && (
                      <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                        {currentQuestion.explanationId}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* RESULTS & REVIEW VIEW (When quiz is completed) */
        <div className="space-y-8 animate-in fade-in-50">
          {/* Result Score Card */}
          <Card className="border-border/80 overflow-hidden shadow-md text-center p-6 sm:p-8">
            <div className="max-w-md mx-auto space-y-4">
              <div
                className={cn(
                  "mx-auto flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold shadow-xs",
                  isPassed
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                )}
              >
                {scorePercent}%
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {isPassed ? t("passedTitle") : t("failedTitle")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {isPassed
                    ? t("passedDesc")
                    : t("failedDesc", { passScore: practiceSet.passScore })}
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 py-2 border-y border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground">{t("correctCountLabel")} </span>
                  <strong className="text-foreground text-sm font-bold">{correctCount}</strong> / {totalQuestions}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("passScoreLabel")} </span>
                  <strong className="text-foreground text-sm font-bold">{practiceSet.passScore}%</strong>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  onClick={handleRestartQuiz}
                  className="w-full sm:w-auto gap-2 shadow-xs"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t("retryQuiz")}
                </Button>
                <Link href="/practice" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full gap-2">
                    {t("backToList")}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Remediation & Review Section */}
          <div className="space-y-4">
            <SectionHeader
              title={t("reviewTitle")}
              description={t("reviewDesc")}
              action={
                <div
                  role="group"
                  aria-label={t("reviewTitle")}
                  className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/60"
                >
                  <button
                    type="button"
                    aria-pressed={reviewFilter === "all"}
                    onClick={() => setReviewFilter("all")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                      reviewFilter === "all"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t("tabAllQuestions", { count: practiceSet.questions.length })}
                  </button>
                  <button
                    type="button"
                    aria-pressed={reviewFilter === "incorrect"}
                    onClick={() => setReviewFilter("incorrect")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                      reviewFilter === "incorrect"
                        ? "bg-destructive/15 text-destructive font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {t("tabIncorrectOnly", { count: totalQuestions - correctCount })}
                  </button>
                </div>
              }
            />

            {/* Questions Review List */}
            {reviewQuestions.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="size-5 text-emerald-500" />}
                title={t("allCorrectPraise")}
                description={t("allCorrectPraiseSub")}
              />
            ) : (
              <div className="space-y-4">
                {reviewQuestions.map((q) => {
                  const userChoice = answers[q.id]
                  const isCorrect = userChoice === q.correctAnswerIndex

                  return (
                    <Card
                      key={q.id}
                      className={cn(
                        "border-border/80 overflow-hidden",
                        isCorrect ? "hover:border-emerald-500/30" : "hover:border-destructive/30"
                      )}
                    >
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-muted-foreground">
                            {t("questionNumber", { number: practiceSet.questions.indexOf(q) + 1 })}
                          </span>
                          {isCorrect ? (
                            <Badge variant="success" className="text-xs gap-1">
                              <CheckCircle2 className="h-3 w-3" /> {t("correctBadge")}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs gap-1">
                              <XCircle className="h-3 w-3" /> {t("incorrectBadge")}
                            </Badge>
                          )}
                        </div>

                        {/* Prompt */}
                        <div className="text-base font-medium leading-relaxed">
                          <FuriganaText html={q.prompt} showFurigana={showFurigana} />
                        </div>

                        {showTranslation && q.translationId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {q.translationId}
                          </p>
                        )}
                      </CardHeader>

                      <CardContent className="p-5 pt-0 space-y-3 text-xs">
                        {/* Options summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isUserPick = userChoice === optIdx
                            const isAnswer = optIdx === q.correctAnswerIndex

                            return (
                              <div
                                key={optIdx}
                                className={cn(
                                  "rounded-lg border p-2.5 flex items-center justify-between",
                                  isAnswer
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200 font-semibold"
                                    : isUserPick
                                    ? "border-destructive bg-destructive/10 text-destructive"
                                    : "border-border/50 text-muted-foreground bg-muted/10"
                                )}
                              >
                                <span>
                                  {q.type === "TRUE_FALSE" ? (optIdx === 0 ? "○ " : "× ") : `${String.fromCharCode(65 + optIdx)}. `}
                                  {opt}
                                </span>
                                {isAnswer && <span className="text-[0.68rem] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-normal">{t("correctAnswerTag")}</span>}
                                {!isAnswer && isUserPick && <span className="text-[0.68rem] bg-destructive text-white px-1.5 py-0.2 rounded font-normal">{t("yourChoiceTag")}</span>}
                              </div>
                            )
                          })}
                        </div>

                        {/* Explanation */}
                        <div className="rounded-lg bg-muted/40 p-3 border border-border/50 space-y-1">
                          <p className="font-semibold text-foreground">{t("explanationLabel")}</p>
                          <p className="text-muted-foreground">{q.explanationJa}</p>
                          {q.explanationId && (
                            <p className="text-muted-foreground pt-1 border-t border-border/40 text-[0.72rem]">
                              {q.explanationId}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation & Action Dock (Prevents layout jump and scroll fatigue) */}
      {!isFinished && (
        <div
          role="toolbar"
          aria-label={t("confirmAnswer")}
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/80 bg-background/95 backdrop-blur-md px-4 py-3 sm:py-4 shadow-xl transition-all"
        >
          <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left: Feedback / Status Indicator */}
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              {!isAnswerConfirmed ? (
                selectedOption === null ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="inline-flex h-2 w-2 rounded-full bg-muted-foreground/50 animate-pulse shrink-0" />
                    <span>{t("selectOptionPrompt")}</span>
                    <span className="hidden sm:inline text-[0.7rem] bg-muted px-1.5 py-0.5 rounded border border-border/60">
                      {t("shortcutSelectHint")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <span className="inline-flex h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span>
                      {t("selectedOption", {
                        choice:
                          currentQuestion.type === "TRUE_FALSE"
                            ? selectedOption === 0
                              ? "○"
                              : "×"
                            : String.fromCharCode(65 + selectedOption),
                      })}{" "}
                      <span className="text-muted-foreground truncate max-w-[180px] sm:max-w-[320px] inline-block align-bottom">
                        ({currentQuestion.options[selectedOption]})
                      </span>
                    </span>
                    <span className="hidden sm:inline text-[0.7rem] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border/60">
                      {t("enterToConfirm")}
                    </span>
                  </div>
                )
              ) : isCurrentCorrect ? (
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{t("correctNotice")}</span>
                  <span className="hidden sm:inline text-[0.7rem] font-normal text-muted-foreground bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {t("enterToNext")}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive font-bold">
                  <XCircle className="h-5 w-5 shrink-0" />
                  <span>
                    {t("incorrectNotice", {
                      answer:
                        currentQuestion.type === "TRUE_FALSE"
                          ? currentQuestion.correctAnswerIndex === 0
                            ? "○"
                            : "×"
                          : String.fromCharCode(65 + currentQuestion.correctAnswerIndex),
                    })}
                  </span>
                  <span className="hidden sm:inline text-[0.7rem] font-normal text-muted-foreground bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/20">
                    {t("enterToNext")}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Primary Action Button (Fixed position, never moves or hides) */}
            <div className="flex items-center gap-2 shrink-0">
              {!isAnswerConfirmed ? (
                <Button
                  size="default"
                  disabled={selectedOption === null}
                  onClick={handleConfirmAnswer}
                  className="w-full sm:w-auto gap-2 shadow-xs text-xs sm:text-sm font-semibold h-10 px-5"
                >
                  {t("confirmAnswer")}
                  <span className="hidden sm:inline text-[0.68rem] opacity-75 font-mono">
                    ↵
                  </span>
                </Button>
              ) : (
                <Button
                  size="default"
                  onClick={handleNextQuestion}
                  className={cn(
                    "w-full sm:w-auto gap-2 shadow-xs text-xs sm:text-sm font-semibold h-10 px-5",
                    isCurrentCorrect
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {currentIndex + 1 < totalQuestions ? (
                    <>
                      {t("nextQuestion")}
                      <ArrowRight className="h-4 w-4" />
                      <span className="hidden sm:inline text-[0.68rem] opacity-75 font-mono">
                        ↵
                      </span>
                    </>
                  ) : (
                    <>
                      {t("viewResults")}
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline text-[0.68rem] opacity-75 font-mono">
                        ↵
                      </span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
