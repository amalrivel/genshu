"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  Award,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { cn } from "@/lib/utils"

export default function ExamsPage() {
  const t = useTranslations("exams")
  const tCommon = useTranslations("common")

  const {
    exams,
    cohorts,
    users,
    currentRole,
    addExam,
    getExamAttempts,
    getStudentExamAttempt,
  } = useData()

  const [selectedCohort, setSelectedCohort] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"all" | "active" | "completed">("all")
  const [createModalOpen, setCreateModalOpen] = React.useState(false)

  // Form states for creating a new exam
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [cohortId, setCohortId] = React.useState(cohorts[0]?.id || "")
  const [targetLevel, setTargetLevel] = React.useState<"N5" | "N4" | "N3" | "N2" | "N1">("N5")
  const [durationMinutes, setDurationMinutes] = React.useState(30)
  const [passScore, setPassScore] = React.useState(70)
  const [allowFurigana, setAllowFurigana] = React.useState(false)
  const [formError, setFormError] = React.useState("")

  const currentStudent = React.useMemo(() => {
    return users.find((u) => u.role === "GAKUSEI") || users[0]
  }, [users])

  const canManage = currentRole === "TANTOSHA" || currentRole === "SENSEI"

  // Filter exams
  const filteredExams = React.useMemo(() => {
    return exams.filter((exam) => {
      // Cohort filter
      if (selectedCohort !== "all" && exam.cohortId !== selectedCohort) {
        return false
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = exam.title.toLowerCase().includes(q)
        const matchDesc = exam.description?.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc) return false
      }
      // Status/Attempt filter
      if (activeTab === "completed") {
        if (currentRole === "GAKUSEI" && currentStudent) {
          const attempt = getStudentExamAttempt(exam.id, currentStudent.id)
          if (!attempt) return false
        }
      } else if (activeTab === "active") {
        if (currentRole === "GAKUSEI" && currentStudent) {
          const attempt = getStudentExamAttempt(exam.id, currentStudent.id)
          if (attempt) return false
        }
      }
      return true
    })
  }, [exams, selectedCohort, searchQuery, activeTab, currentRole, currentStudent, getStudentExamAttempt])

  // Aggregate stats
  const stats = React.useMemo(() => {
    if (currentRole === "GAKUSEI" && currentStudent) {
      let attempted = 0
      let passed = 0
      let totalScore = 0

      exams.forEach((ex) => {
        const att = getStudentExamAttempt(ex.id, currentStudent.id)
        if (att) {
          attempted++
          if (att.passed) passed++
          totalScore += att.percentage
        }
      })

      const avg = attempted > 0 ? Math.round(totalScore / attempted) : 0
      return { total: exams.length, primary: attempted, passed, avg }
    } else {
      let totalAttemptsCount = 0
      let totalPassedCount = 0
      let totalPercentage = 0

      exams.forEach((ex) => {
        const atts = getExamAttempts(ex.id)
        atts.forEach((a) => {
          totalAttemptsCount++
          if (a.passed) totalPassedCount++
          totalPercentage += a.percentage
        })
      })

      const avg = totalAttemptsCount > 0 ? Math.round(totalPercentage / totalAttemptsCount) : 0
      return { total: exams.length, primary: totalAttemptsCount, passed: totalPassedCount, avg }
    }
  }, [exams, currentRole, currentStudent, getStudentExamAttempt, getExamAttempts])

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !cohortId) {
      setFormError(t("errorFillFields"))
      return
    }

    // Default authentic sample questions for teacher quick creation
    const sampleQuestions = [
      {
        id: `eq-${Date.now()}-1`,
        prompt: "毎日の習慣について、正しい助詞を選びなさい。\n私は毎朝、新聞（　　）読みます。",
        promptPlain: "毎日の習慣について、正しい助詞を選びなさい。\n私は毎朝、新聞（　　）読みます。",
        translationId: "Pilihlah partikel yang tepat: 'Setiap pagi saya membaca koran.'",
        options: ["を", "に", "で", "が"],
        correctAnswerIndex: 0,
        explanationJa: "読む動作の対象（目的語）には助詞「を」を使います。",
        explanationId: "Partikel 'を' (o) menandai objek dari kata kerja membaca.",
        points: 25,
      },
      {
        id: `eq-${Date.now()}-2`,
        prompt: "来週の予定を話します。\n来週、日本へ（　　）予定です。",
        promptPlain: "来週の予定を話します。\n来週、日本へ（　　）予定です。",
        translationId: "Minggu depan berencana (pergi) ke Jepang.",
        options: ["行く", "行きます", "行った", "行かない"],
        correctAnswerIndex: 0,
        explanationJa: "「予定です」の前には動詞の辞書形（行く）が接続します。",
        explanationId: "Pola '〜予定です' (berencana) didahului kata kerja bentuk kamus (jishokei).",
        points: 25,
      },
      {
        id: `eq-${Date.now()}-3`,
        prompt: "病院で薬をもらいました。食後に（　　）ください。",
        promptPlain: "病院で薬をもらいました。食後に（　　）ください。",
        translationId: "Minumlah obat ini setelah makan.",
        options: ["飲んで", "飲みて", "飲むで", "飲まないで"],
        correctAnswerIndex: 0,
        explanationJa: "「飲む」のて形は「飲んで」です。",
        explanationId: "Bentuk -te dari kata kerja '飲む' (nomu) adalah '飲んで' (nonde).",
        points: 25,
      },
      {
        id: `eq-${Date.now()}-4`,
        prompt: "【読解】明日は朝9時に駅の西口で集合します。雨が降っても出発しますので、傘を忘れないでください。\n質問: 明日はどのような天気でも出発しますか。",
        promptPlain: "【読解】明日は朝9時に駅の西口で集合します。雨が降っても出発しますので、傘を忘れないでください。\n質問: 明日はどのような天気でも出発しますか。",
        translationId: "[Bacaan] Besok berkumpul jam 9 di pintu barat stasiun. Karena tetap berangkat meskipun hujan, jangan lupa bawa payung. Pertanyaan: Apakah besok tetap berangkat meski hujan?",
        options: ["はい、出発します", "いいえ、中止です", "午後から出発します", "傘があれば中止です"],
        correctAnswerIndex: 0,
        explanationJa: "本文に「雨が降っても出発します」と明確に記載されています。",
        explanationId: "Teks secara eksplisit menyebutkan '雨が降っても出発します' (tetap berangkat meski hujan).",
        points: 25,
      },
    ]

    addExam({
      cohortId,
      title: title.trim(),
      description: description.trim(),
      targetLevel,
      durationMinutes: Number(durationMinutes),
      passScore: Number(passScore),
      allowFurigana,
      status: "ACTIVE",
      instructorId: "user-s1",
      instructorName: "田中 晶子 (Tanaka Akiko)",
      questions: sampleQuestions,
    })

    setTitle("")
    setDescription("")
    setDurationMinutes(30)
    setPassScore(70)
    setAllowFurigana(false)
    setFormError("")
    setCreateModalOpen(false)
  }

  return (
    <div className="page-shell pb-12">
      {/* Header Banner */}
      <div className="page-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              アセスメント・試験
            </span>
            <span className="text-xs text-muted-foreground">
              {currentRole === "GAKUSEI" ? tCommon("roleGakusei") : tCommon("roleSensei")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {currentRole === "GAKUSEI" ? t("descStudent") : t("descStaff")}
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="self-start md:self-auto gap-2 shadow-xs bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <span>{t("createExam")}</span>
          </Button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {t("statTotalExams")}
              </span>
              <Award className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stats.total}</p>
            <p className="text-[0.7rem] text-muted-foreground mt-0.5">
              {t("allCohorts")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {t("statAttempted")}
              </span>
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {stats.primary}
            </p>
            <p className="text-[0.7rem] text-muted-foreground mt-0.5">
              {currentRole === "GAKUSEI" ? "Ujian selesai" : "Total sesi ujian"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {t("statPassed")}
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats.passed}
            </p>
            <p className="text-[0.7rem] text-muted-foreground mt-0.5">
              {t("statusPassed")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {t("statAverageScore")}
              </span>
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {stats.avg}%
            </p>
            <p className="text-[0.7rem] text-muted-foreground mt-0.5">
              {t("passThreshold", { score: "70" })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="filter-toolbar">
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border/80 bg-muted/40 self-start">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-colors",
              activeTab === "all"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("tabAll")}
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-colors",
              activeTab === "active"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("tabActive")}
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-colors",
              activeTab === "completed"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("tabCompleted")}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Cohort Select */}
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">{t("allCohorts")}</option>
            {cohorts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                aria-label={t("searchPlaceholder")}
                value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
                className="pl-8 text-sm h-10"
            />
          </div>
        </div>
      </div>

      {/* Exam Grid */}
      {filteredExams.length === 0 ? (
      <div className="empty-state space-y-3">
          <Award className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">{t("noExamsFound")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredExams.map((exam) => {
            const cohort = cohorts.find((c) => c.id === exam.cohortId)
            const studentAttempt =
              currentRole === "GAKUSEI" && currentStudent
                ? getStudentExamAttempt(exam.id, currentStudent.id)
                : null
            const allAttempts = getExamAttempts(exam.id)
            const isCompleted = Boolean(studentAttempt)

            return (
              <Card
                key={exam.id}
                className={cn(
                  "border-border/80 transition-all hover:shadow-md flex flex-col justify-between",
                  isCompleted && "border-blue-500/30 bg-blue-50/5 dark:bg-blue-950/5"
                )}
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs font-bold">
                        {exam.targetLevel}
                      </Badge>
                      {cohort && (
                        <Badge variant="secondary" className="font-mono text-xs">
                          {cohort.code}
                        </Badge>
                      )}
                      <span className="flex items-center gap-1 text-[0.72rem] text-muted-foreground font-medium">
                        <Clock className="h-3 w-3" />
                        {t("durationBadge", { minutes: exam.durationMinutes })}
                      </span>
                    </div>

                    {/* Furigana badge */}
                    <span
                      className={cn(
                        "text-[0.68rem] px-2 py-0.5 rounded font-medium",
                        exam.allowFurigana
                          ? "bg-muted text-muted-foreground"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                      )}
                    >
                      {exam.allowFurigana ? t("furiganaEnabled") : t("furiganaDisabled")}
                    </span>
                  </div>

                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold hover:text-primary transition-colors leading-snug">
                      <Link href={`/exams/${exam.id}`}>{exam.title}</Link>
                    </CardTitle>
                    {exam.description && (
                      <CardDescription className="text-xs line-clamp-2 mt-1.5 leading-relaxed">
                        {exam.description}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Exam metadata pills */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span>{t("questionsCount", { count: exam.questions.length })}</span>
                    <span>{t("passThreshold", { score: exam.passScore })}</span>
                  </div>

                  {/* Student Attempt Status Banner */}
                  {currentRole === "GAKUSEI" && (
                    <div className="rounded-lg p-2.5 text-xs flex items-center justify-between bg-muted/40 border border-border/50">
                      {studentAttempt ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={studentAttempt.passed ? "success" : "destructive"}
                              className="text-[0.68rem] font-bold"
                            >
                              {studentAttempt.passed ? t("statusPassed") : t("statusFailed")}
                            </Badge>
                            <span className="font-semibold text-foreground">
                              {studentAttempt.percentage}% ({studentAttempt.score}/{studentAttempt.maxScore})
                            </span>
                          </div>
                          <span className="text-[0.7rem] text-muted-foreground">
                            {studentAttempt.submittedAt}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5 text-amber-500" />
                            <span>{t("statusNotAttempted")}</span>
                          </div>
                          <span className="text-[0.7rem] text-amber-600 dark:text-amber-400 font-medium">
                            {t("tabActive")}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Teacher/Tantōsha Cohort Summary Banner */}
                  {canManage && (
                    <div className="rounded-lg p-2.5 text-xs flex items-center justify-between bg-muted/40 border border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Peserta:</span>
                        <span className="font-semibold text-foreground font-mono">
                          {allAttempts.length} siswa
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Kelulusan:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                          {allAttempts.length > 0
                            ? `${Math.round((allAttempts.filter((a) => a.passed).length / allAttempts.length) * 100)}%`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action CTA Button */}
                  <div className="pt-1">
                    <Link href={`/exams/${exam.id}`} className="block">
                      {isCompleted ? (
                        <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                          <span>{t("viewResults")}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full gap-2 text-xs shadow-xs bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <Award className="h-3.5 w-3.5" />
                          <span>{t("startExam")}</span>
                        </Button>
                      )}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Exam Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t("createModalTitle")}</DialogTitle>
            <DialogDescription className="text-xs">{t("createModalDesc")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateExam} className="space-y-4 pt-2 text-xs">
            {formError && (
              <div role="alert" aria-live="polite" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">{t("fieldTitle")}</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: JLPT N5 第2回 語彙・読解模擬試験"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">{t("fieldCohort")}</label>
                <select
                  value={cohortId}
                  onChange={(e) => setCohortId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">{t("fieldLevel")}</label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value as "N5")}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="N5">JLPT N5</option>
                  <option value="N4">JLPT N4</option>
                  <option value="N3">JLPT N3</option>
                  <option value="N2">JLPT N2</option>
                  <option value="N1">JLPT N1</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">{t("fieldDuration")}</label>
                <Input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">{t("fieldPassScore")}</label>
                <Input
                  type="number"
                  min={10}
                  max={100}
                  value={passScore}
                  onChange={(e) => setPassScore(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="allowFurigana"
                checked={allowFurigana}
                onChange={(e) => setAllowFurigana(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="allowFurigana" className="font-medium text-foreground cursor-pointer">
                {t("fieldAllowFurigana")}
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">{t("fieldDescription")}</label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Catatan aturan khusus ujian, materi yang diujikan..."
                className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-sans"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCreateModalOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                {t("saveExam")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
