"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckSquare,
  Plus,
  Search,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useData } from "@/lib/data-context"
import { type PracticeQuestion } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export default function PracticePage() {
  const t = useTranslations("practice")
  const tCommon = useTranslations("common")

  const { practiceSets, cohorts, currentRole, addPracticeSet, getBestAttempt } = useData()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [levelFilter, setLevelFilter] = React.useState<"ALL" | "N5" | "N4" | "N3">("ALL")
  const [topicFilter, setTopicFilter] = React.useState<string>("ALL")
  const [cohortFilter, setCohortFilter] = React.useState<string>("ALL")
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  // Form state
  const [newTitle, setNewTitle] = React.useState("")
  const [newCohortId, setNewCohortId] = React.useState("cohort-1")
  const [newTargetLevel, setNewTargetLevel] = React.useState<"N5" | "N4" | "N3">("N5")
  const [newTopic, setNewTopic] = React.useState<"語彙" | "文法" | "文化・マナー" | "漢字">("語彙")
  const [newDescription, setNewDescription] = React.useState("")
  const [newPassScore, setNewPassScore] = React.useState(70)

  // Question builder for new set (start with 2 template questions)
  const [questions, setQuestions] = React.useState<
    Array<{
      prompt: string
      translationId: string
      options: string[]
      correctAnswerIndex: number
      explanationJa: string
      explanationId: string
    }>
  >([
    {
      prompt: "<ruby>日本<rt>にほん</rt></ruby>へ（　　）行きます。",
      translationId: "Pergi ke Jepang pada bulan (...).",
      options: ["４月", "４日", "４時", "４年"],
      correctAnswerIndex: 0,
      explanationJa: "「４月（しがつ）」が自然です。月を表す表現です。",
      explanationId: "Pilihan '４月' (bulan April) paling tepat dalam konteks kalender.",
    },
  ])

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"

  // Filtered sets
  const filteredSets = practiceSets.filter((set) => {
    const matchesSearch =
      set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = levelFilter === "ALL" || set.targetLevel === levelFilter
    const matchesTopic = topicFilter === "ALL" || set.topic === topicFilter
    const matchesCohort =
      cohortFilter === "ALL" || set.cohortId === "all" || set.cohortId === cohortFilter
    return matchesSearch && matchesLevel && matchesTopic && matchesCohort
  })

  const handleAddQuestionField = () => {
    setQuestions((prev) => [
      ...prev,
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

  const handleCreateSet = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const formattedQuestions: PracticeQuestion[] = questions.map((q, idx) => ({
      id: `custom-q-${Date.now()}-${idx}`,
      type: "MULTIPLE_CHOICE",
      prompt: q.prompt.trim() || `問題 ${idx + 1}`,
      promptPlain: q.prompt.replace(/<[^>]*>/g, ""),
      translationId: q.translationId.trim() || "Terjemahan latihan",
      options: q.options.filter((o) => o.trim().length > 0),
      correctAnswerIndex: q.correctAnswerIndex,
      explanationJa: q.explanationJa.trim() || "解説が登録されていません。",
      explanationId: q.explanationId.trim() || "Belum ada penjelasan.",
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
  }

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("title")}
            </h1>
            <Badge variant="outline" className="text-xs font-normal">
              {t("badge")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("desc")}
          </p>
        </div>

        {canManage ? (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 shadow-xs sm:self-start"
          >
            <Plus className="h-4 w-4" />
            {t("createSet")}
          </Button>
        ) : (
          <div className="text-xs bg-muted/60 text-muted-foreground px-3 py-1.5 rounded-md border border-border/60">
            {tCommon("roleGakusei")}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="filter-toolbar">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label={t("searchPlaceholder")}
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>

          {/* Cohort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0 font-medium">{t("filterCohort")}</span>
            <select
              className="h-10 rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
            >
              <option value="ALL">{t("allCohorts")}</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name.substring(0, 16)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Level and Topic Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-muted-foreground mr-1">{t("filterLevel")}</span>
            {(["ALL", "N5", "N4", "N3"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={cn(
                  "min-h-9 px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                  levelFilter === lvl
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {lvl === "ALL" ? t("allLevels") : lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-muted-foreground mr-1">{t("filterTopic")}</span>
            {(["ALL", "語彙", "文法", "文化・マナー", "漢字"] as const).map((top) => {
              const label =
                top === "ALL"
                  ? t("allTopics")
                  : top === "語彙"
                  ? t("topicVocab")
                  : top === "文法"
                  ? t("topicGrammar")
                  : top === "文化・マナー"
                  ? t("topicCulture")
                  : t("topicKanji")
              return (
                <button
                  key={top}
                  onClick={() => setTopicFilter(top)}
                  className={cn(
                    "min-h-9 px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                    topicFilter === top
                      ? "bg-secondary text-secondary-foreground font-semibold shadow-xs"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Practice Sets Grid */}
      {filteredSets.length === 0 ? (
        <div className="empty-state">
          <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="mt-4 text-base font-semibold">{t("noSetsFound")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("noSetsDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredSets.map((set) => {
            const bestAttempt = getBestAttempt(set.id)
            const targetCohort = cohorts.find((c) => c.id === set.cohortId)

            return (
              <Card
                key={set.id}
                className="group flex flex-col justify-between overflow-hidden border-border/80 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-xs">
                          {set.targetLevel}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {set.topic}
                        </Badge>
                      </div>

                      {bestAttempt ? (
                        <Badge
                          variant={
                            (bestAttempt.score / bestAttempt.totalQuestions) * 100 >=
                            set.passScore
                              ? "success"
                              : "warning"
                          }
                          className="text-xs gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {t("bestScore")}{" "}
                          {Math.round(
                            (bestAttempt.score / bestAttempt.totalQuestions) * 100
                          )}
                          %
                        </Badge>
                      ) : (
                        <span className="text-[0.7rem] text-muted-foreground">
                          {t("notAttempted")}
                        </span>
                      )}
                    </div>

                    <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-colors">
                      {set.title}
                    </CardTitle>

                    <CardDescription className="line-clamp-2 mt-2 text-xs text-muted-foreground">
                      {set.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3 text-xs">
                    <div className="rounded-lg bg-muted/40 p-2.5 flex items-center justify-between border border-border/40 text-muted-foreground">
                      <span>{t("questionCount")} <strong className="text-foreground">{set.questions.length}</strong></span>
                      <span>{t("passCriteria")} <strong className="text-foreground">{set.passScore}%</strong></span>
                      <span>
                        {set.cohortId === "all" ? (
                          tCommon("all")
                        ) : (
                          <span className="font-mono">{targetCohort?.code || "Cohort"}</span>
                        )}
                      </span>
                    </div>
                  </CardContent>
                </div>

                {/* Card Action */}
                <div className="border-t border-border/60 bg-muted/10 p-3 px-5 flex items-center justify-between">
                  <span className="text-[0.7rem] text-muted-foreground">
                    {set.createdAt}
                  </span>
                  <Link href={`/practice/${set.id}`}>
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs h-8 shadow-xs"
                    >
                      {bestAttempt ? t("retakePractice") : t("startPractice")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Practice Set Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("modalTitle")}</DialogTitle>
            <DialogDescription>
              {t("modalDesc")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSet} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-medium mb-1">
                {t("modalFieldTitle")}
              </label>
              <Input
                placeholder="例: N5 基礎語彙・動詞活用ドリル"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">{t("modalFieldLevel")}</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newTargetLevel}
                  onChange={(e) => setNewTargetLevel(e.target.value as "N5" | "N4" | "N3")}
                >
                  <option value="N5">N5</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">{t("modalFieldTopic")}</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newTopic}
                  onChange={(e) =>
                    setNewTopic(e.target.value as "語彙" | "文法" | "文化・マナー" | "漢字")
                  }
                >
                  <option value="語彙">{t("topicVocab")}</option>
                  <option value="文法">{t("topicGrammar")}</option>
                  <option value="文化・マナー">{t("topicCulture")}</option>
                  <option value="漢字">{t("topicKanji")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">{t("modalFieldCohort")}</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newCohortId}
                  onChange={(e) => setNewCohortId(e.target.value)}
                >
                  <option value="all">{t("allCohorts")}</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name.substring(0, 14)}...
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">{t("modalFieldDesc")}</label>
                <Input
                  placeholder="学習者がこのドリルで達成すべき内容を入力..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">{t("modalFieldPassScore")}</label>
                <Input
                  type="number"
                  min={50}
                  max={100}
                  value={newPassScore}
                  onChange={(e) => setNewPassScore(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">登録する問題 ({questions.length}問)</span>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleAddQuestionField}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  問題を追加
                </Button>
              </div>

              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border p-3.5 space-y-2.5 bg-muted/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-primary">第 {idx + 1} 問</span>
                  </div>

                  <div>
                    <label className="block text-[0.7rem] text-muted-foreground mb-0.5">
                      問題文（ふりがなタグ &lt;ruby&gt;漢字&lt;rt&gt;かんじ&lt;/rt&gt;&lt;/ruby&gt; を使えます）
                    </label>
                    <Input
                      placeholder="例: <ruby>朝<rt>あさ</rt></ruby>起きて、顔を（　　）。"
                      value={q.prompt}
                      onChange={(e) => {
                        const updated = [...questions]
                        updated[idx].prompt = e.target.value
                        setQuestions(updated)
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[0.7rem] text-muted-foreground mb-0.5">
                      インドネシア語訳 (Terjemahan Bantuan)
                    </label>
                    <Input
                      placeholder="例: Bangun di pagi hari, (...) muka."
                      value={q.translationId}
                      onChange={(e) => {
                        const updated = [...questions]
                        updated[idx].translationId = e.target.value
                        setQuestions(updated)
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx}>
                        <label className="block text-[0.68rem] text-muted-foreground mb-0.5">
                          選択肢 {oIdx + 1} {q.correctAnswerIndex === oIdx && "(★ 正解)"}
                        </label>
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const updated = [...questions]
                            updated[idx].options[oIdx] = e.target.value
                            setQuestions(updated)
                          }}
                          className={q.correctAnswerIndex === oIdx ? "border-emerald-500/60" : ""}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">正解の番号:</span>
                    <select
                      className="h-8 rounded border border-input bg-card px-2 text-xs"
                      value={q.correctAnswerIndex}
                      onChange={(e) => {
                        const updated = [...questions]
                        updated[idx].correctAnswerIndex = Number(e.target.value)
                        setQuestions(updated)
                      }}
                    >
                      {q.options.map((_, oIdx) => (
                        <option key={oIdx} value={oIdx}>
                          選択肢 {oIdx + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[0.7rem] text-muted-foreground mb-0.5">
                      解説（日本語）
                    </label>
                    <Input
                      placeholder="例: 「顔を洗う」が自然な組み合わせです。"
                      value={q.explanationJa}
                      onChange={(e) => {
                        const updated = [...questions]
                        updated[idx].explanationJa = e.target.value
                        setQuestions(updated)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit">{t("modalSubmit")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
