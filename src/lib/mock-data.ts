export type UserRole = "GAKUSEI" | "SENSEI" | "TANTOSHA"

export type CohortStatus = "active" | "upcoming" | "completed" | "archived"

export interface User {
  id: string
  name: string
  japaneseName?: string
  email: string
  role: UserRole
  status: "active" | "inactive"
  enrolledCohortIds: string[]
  joinedDate: string
  notes?: string
}

export interface Cohort {
  id: string
  name: string
  code: string
  description: string
  targetLevel: string
  startDate: string
  endDate: string
  status: CohortStatus
  createdAt: string
}

export const INITIAL_COHORTS: Cohort[] = [
  {
    id: "cohort-1",
    name: "第1期 日本奨学金準備生 (Batch 1 - 2026)",
    code: "KNS-2026-01",
    description: "インドネシア人奨学生向け日本語および文化集中研修プログラム (Intensive Japanese Language & Cultural Training for Scholarship Recipients)",
    targetLevel: "N5 → N4",
    startDate: "2026-04-01",
    endDate: "2026-10-31",
    status: "active",
    createdAt: "2026-03-15",
  },
  {
    id: "cohort-2",
    name: "第2期 日本語集中基礎コース (Batch 2 - Prep)",
    code: "KNS-2026-02",
    description: "奨学金選抜合格者を対象とした基礎会話および語彙トレーニング (Foundational Conversation & Vocabulary for Shortlisted Candidates)",
    targetLevel: "N5 Foundation",
    startDate: "2026-08-15",
    endDate: "2027-02-28",
    status: "upcoming",
    createdAt: "2026-07-01",
  },
  {
    id: "cohort-3",
    name: "第0期 パイロット生プレ研修 (Pilot Cohort 2025)",
    code: "PILOT-2025",
    description: "事前カリキュラム評価および教材検証パイロットグループ (Pilot Curriculum Evaluation & Material Validation)",
    targetLevel: "N4",
    startDate: "2025-10-01",
    endDate: "2026-03-31",
    status: "completed",
    createdAt: "2025-09-10",
  },
]

export const INITIAL_USERS: User[] = [
  // Tantōsha (Coordinators)
  {
    id: "user-t1",
    name: "Kenichi Sato",
    japaneseName: "佐藤 健一",
    email: "sato.kenichi@genshu.edu",
    role: "TANTOSHA",
    status: "active",
    enrolledCohortIds: ["cohort-1", "cohort-2", "cohort-3"],
    joinedDate: "2025-08-01",
    notes: "Lead Program Coordinator (Tokyo)",
  },
  {
    id: "user-t2",
    name: "Dewi Lestari",
    japaneseName: "デウィ・レスタリ",
    email: "dewi.lestari@genshu.edu",
    role: "TANTOSHA",
    status: "active",
    enrolledCohortIds: ["cohort-1", "cohort-2"],
    joinedDate: "2025-09-15",
    notes: "Student Affairs & Logistics (Jakarta)",
  },

  // Sensei (Instructors)
  {
    id: "user-s1",
    name: "Akiko Tanaka",
    japaneseName: "田中 晶子",
    email: "tanaka.sensei@genshu.edu",
    role: "SENSEI",
    status: "active",
    enrolledCohortIds: ["cohort-1", "cohort-2"],
    joinedDate: "2025-10-01",
    notes: "Grammar & Kanji Lead Instructor",
  },
  {
    id: "user-s2",
    name: "Hiroshi Watanabe",
    japaneseName: "渡辺 裕",
    email: "watanabe.sensei@genshu.edu",
    role: "SENSEI",
    status: "active",
    enrolledCohortIds: ["cohort-1"],
    joinedDate: "2025-10-01",
    notes: "Conversation & Culture Specialist",
  },
  {
    id: "user-s3",
    name: "Budi Santoso",
    japaneseName: "ブディ・サントソ",
    email: "budi.sensei@genshu.edu",
    role: "SENSEI",
    status: "active",
    enrolledCohortIds: ["cohort-2"],
    joinedDate: "2026-02-01",
    notes: "Bilingual Teaching Assistant & Phonetics",
  },

  // Gakusei (Students)
  {
    id: "user-g1",
    name: "Ahmad Fauzi",
    japaneseName: "アフマッド・ファウジ",
    email: "ahmad.fauzi@student.genshu.edu",
    role: "GAKUSEI",
    status: "active",
    enrolledCohortIds: ["cohort-1"],
    joinedDate: "2026-03-20",
    notes: "Bandung Institute Candidate",
  },
  {
    id: "user-g2",
    name: "Nur Aini",
    japaneseName: "ヌル・アイニ",
    email: "nur.aini@student.genshu.edu",
    role: "GAKUSEI",
    status: "active",
    enrolledCohortIds: ["cohort-1"],
    joinedDate: "2026-03-20",
    notes: "Universitas Indonesia Candidate",
  },
  {
    id: "user-g3",
    name: "Dimas Aditya",
    japaneseName: "ディマス・アディティヤ",
    email: "dimas.aditya@student.genshu.edu",
    role: "GAKUSEI",
    status: "active",
    enrolledCohortIds: ["cohort-1"],
    joinedDate: "2026-03-21",
    notes: "Yogyakarta Candidate",
  },
  {
    id: "user-g4",
    name: "Siti Rahma",
    japaneseName: "シティ・ラフマ",
    email: "siti.rahma@student.genshu.edu",
    role: "GAKUSEI",
    status: "active",
    enrolledCohortIds: ["cohort-1", "cohort-2"],
    joinedDate: "2026-03-21",
    notes: "Surabaya Candidate",
  },
  {
    id: "user-g5",
    name: "Fajar Nugraha",
    japaneseName: "ファジャル・ヌグラハ",
    email: "fajar.nugraha@student.genshu.edu",
    role: "GAKUSEI",
    status: "active",
    enrolledCohortIds: ["cohort-1"],
    joinedDate: "2026-03-22",
  },
  {
    id: "user-g6",
    name: "Tri Wahyuni",
    japaneseName: "トリ・ワヒュニ",
    email: "tri.wahyuni@student.genshu.edu",
    role: "GAKUSEI",
    status: "active",
    enrolledCohortIds: ["cohort-2"],
    joinedDate: "2026-07-10",
  },
  {
    id: "user-g7",
    name: "Bambang Hidayat",
    japaneseName: "バンバン・ヒダヤット",
    email: "bambang.h@student.genshu.edu",
    role: "GAKUSEI",
    status: "active",
    enrolledCohortIds: ["cohort-2"],
    joinedDate: "2026-07-12",
  },
  {
    id: "user-g8",
    name: "Putri Handayani",
    japaneseName: "プトゥリ・ハンダヤニ",
    email: "putri.h@student.genshu.edu",
    role: "GAKUSEI",
    status: "active",
    enrolledCohortIds: ["cohort-3"],
    joinedDate: "2025-09-25",
  },
]

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE"

export interface PracticeQuestion {
  id: string
  type: QuestionType
  prompt: string // Japanese with ruby HTML e.g. <ruby>明日<rt>あした</rt></ruby>
  promptPlain: string
  translationId: string // Indonesian translation
  options: string[]
  correctAnswerIndex: number
  explanationJa: string
  explanationId: string // Indonesian explanation
}

export interface PracticeSet {
  id: string
  title: string
  cohortId: string | "all"
  targetLevel: "N5" | "N4" | "N3"
  topic: "語彙" | "文法" | "文化・マナー" | "漢字"
  description: string
  passScore: number // percentage e.g. 70
  createdAt: string
  questions: PracticeQuestion[]
}

export interface PracticeAttempt {
  id: string
  practiceSetId: string
  userId: string
  score: number
  totalQuestions: number
  answers: Record<string, number> // questionId -> chosenOptionIndex
  completedAt: string
}

export const INITIAL_PRACTICE_SETS: PracticeSet[] = [
  {
    id: "practice-1",
    title: "N5 基礎語彙・生活単語ドリル",
    cohortId: "cohort-1",
    targetLevel: "N5",
    topic: "語彙",
    description: "日本での生活で毎日使う重要名詞と動詞の基本チェック。正しい意味・読み方を選びましょう。",
    passScore: 70,
    createdAt: "2026-04-10",
    questions: [
      {
        id: "p1-q1",
        type: "MULTIPLE_CHOICE",
        prompt: "<ruby>朝<rt>あさ</rt></ruby>起きて、まず顔を（　　）。",
        promptPlain: "朝起きて、まず顔を（　　）。",
        translationId: "Bangun di pagi hari, pertama-tama (...) muka.",
        options: ["のみます", "たべます", "あらいます", "ききます"],
        correctAnswerIndex: 2,
        explanationJa: "「顔を洗います（あらいます）」が正解です。「顔」と組み合わせて使う動詞は「洗う」です。",
        explanationId: "Jawaban yang benar adalah 'あらいます' (mencuci). Pasangan kata untuk '顔' (muka) adalah '洗う' (mencuci).",
      },
      {
        id: "p1-q2",
        type: "MULTIPLE_CHOICE",
        prompt: "<ruby>毎朝<rt>まいあさ</rt></ruby>７時に（　　）へ行って、電車に乗ります。",
        promptPlain: "毎朝７時に（　　）へ行って、電車に乗ります。",
        translationId: "Setiap pagi jam 7 pergi ke (...) lalu naik kereta.",
        options: ["えき", "ぎんこう", "びょういん", "ゆうびんきょく"],
        correctAnswerIndex: 0,
        explanationJa: "「電車に乗る」場所は「駅（えき）」です。銀行（ぎんこう）、病院（びょういん）、郵便局（ゆうびんきょく）ではありません。",
        explanationId: "Tempat untuk naik kereta (電車に乗る) adalah stasiun (駅 / えき).",
      },
      {
        id: "p1-q3",
        type: "MULTIPLE_CHOICE",
        prompt: "スーパーでりんごとバナナを（　　）。",
        promptPlain: "スーパーでりんごとバナナを（　　）。",
        translationId: "Di supermarket (...) apel dan pisang.",
        options: ["かいました", "まちました", "たちました", "おきました"],
        correctAnswerIndex: 0,
        explanationJa: "「買いました（かいました）」が正解です。スーパーで買い物をする動詞「買う」の過去形です。",
        explanationId: "'かいました' (telah membeli) adalah bentuk lampau dari 'かう' (membeli), sesuai untuk konteks supermarket.",
      },
      {
        id: "p1-q4",
        type: "MULTIPLE_CHOICE",
        prompt: "すみません、この漢字の（　　）を教えてください。",
        promptPlain: "すみません、この漢字の（　　）を教えてください。",
        translationId: "Permisi, tolong ajarkan cara (...) kanji ini.",
        options: ["よみかた", "たべかた", "あるきかた", "のみかた"],
        correctAnswerIndex: 0,
        explanationJa: "「読み方（よみかた）」が正解です。漢字は「読む」ものなので「読み方（Cara membaca）」を使います。",
        explanationId: "'よみかた' (cara membaca) adalah pilihan tepat untuk objek kanji.",
      },
    ],
  },
  {
    id: "practice-2",
    title: "助詞マスター！「は・が・に・で・を」文法チェック",
    cohortId: "cohort-1",
    targetLevel: "N5",
    topic: "文法",
    description: "日本語学習者が最初につまずきやすい助詞の使い方をマスターするための集中ドリルです。",
    passScore: 75,
    createdAt: "2026-04-12",
    questions: [
      {
        id: "p2-q1",
        type: "MULTIPLE_CHOICE",
        prompt: "わたしはバス（　　）学校へ行きます。",
        promptPlain: "わたしはバス（　　）学校へ行きます。",
        translationId: "Saya pergi ke sekolah (dengan/menggunakan) bus.",
        options: ["を", "に", "で", "へ"],
        correctAnswerIndex: 2,
        explanationJa: "手段・交通手段を表す助詞は「で」を使います。「バスで行きます」。",
        explanationId: "Partikel 'で' digunakan untuk menyatakan sarana atau alat transportasi (naik bus).",
      },
      {
        id: "p2-q2",
        type: "MULTIPLE_CHOICE",
        prompt: "日曜日（　　）友達と買い物をしました。",
        promptPlain: "日曜日（　　）友達と買い物をしました。",
        translationId: "(Pada) hari Minggu, berbelanja bersama teman.",
        options: ["に", "で", "を", "へ"],
        correctAnswerIndex: 0,
        explanationJa: "具体的な時間・曜日を表す名詞には助詞「に」がつきます。",
        explanationId: "Partikel 'に' digunakan untuk waktu spesifik atau hari dalam seminggu (pada hari Minggu).",
      },
      {
        id: "p2-q3",
        type: "MULTIPLE_CHOICE",
        prompt: "教室に田中先生（　　）います。",
        promptPlain: "教室に田中先生（　　）います。",
        translationId: "Di dalam kelas (ada) Tanaka Sensei.",
        options: ["が", "を", "で", "に"],
        correctAnswerIndex: 0,
        explanationJa: "存在を表す文（います／あります）の主語には助詞「が」を使います。",
        explanationId: "Subjek keberadaan pada pola kalimat 'います/あります' ditandai dengan partikel 'が'.",
      },
      {
        id: "p2-q4",
        type: "MULTIPLE_CHOICE",
        prompt: "<ruby>図書館<rt>としょかん</rt></ruby>（　　）本を借りました。",
        promptPlain: "図書館（　　）本を借りました。",
        translationId: "Meminjam buku (di/dari) perpustakaan.",
        options: ["で", "へ", "を", "が"],
        correctAnswerIndex: 0,
        explanationJa: "動作が行われる場所を表す助詞は「で」です。",
        explanationId: "Partikel 'で' digunakan untuk tempat terjadinya suatu tindakan/kegiatan.",
      },
    ],
  },
  {
    id: "practice-3",
    title: "日本生活ルール＆マナー ○×判定クイズ",
    cohortId: "all",
    targetLevel: "N5",
    topic: "文化・マナー",
    description: "日本での寮生活や街中、学校でのマナーについての正誤（○×）判定クイズです。",
    passScore: 80,
    createdAt: "2026-04-15",
    questions: [
      {
        id: "p3-q1",
        type: "TRUE_FALSE",
        prompt: "日本の家や寮に入るときは、玄関で靴を脱ぎます。",
        promptPlain: "日本の家や寮に入るときは、玄関で靴を脱ぎます。",
        translationId: "Saat memasuki rumah atau asrama di Jepang, kita melepas sepatu di pintu masuk (genkan).",
        options: ["○（正しい / Benar）", "×（誤り / Salah）"],
        correctAnswerIndex: 0,
        explanationJa: "正解は「○」です。日本の住居では、玄関で靴を脱いで上がります。",
        explanationId: "Benar (○). Di Jepang adalah kebiasaan wajib untuk melepas sepatu di genkan sebelum masuk ke dalam rumah/asrama.",
      },
      {
        id: "p3-q2",
        type: "TRUE_FALSE",
        prompt: "電車やバスの中では、大きな声で電話で話してもよいです。",
        promptPlain: "電車やバスの中では、大きな声で電話で話してもよいです。",
        translationId: "Di dalam kereta atau bus, boleh berbicara lewat telepon dengan suara keras.",
        options: ["○（正しい / Benar）", "×（誤り / Salah）"],
        correctAnswerIndex: 1,
        explanationJa: "正解は「×」です。日本の公共交通機関では、マナーモードに設定し通話は控えるのがルールです。",
        explanationId: "Salah (×). Di transportasi umum Jepang, ponsel harus diatur ke mode hening (manner mode) dan tidak boleh menelepon.",
      },
      {
        id: "p3-q3",
        type: "TRUE_FALSE",
        prompt: "ごみは種類（燃えるごみ、燃えないごみ、ペットボトルなど）ごとに分別して捨てます。",
        promptPlain: "ごみは種類（燃えるごみ、燃えないごみ、ペットボトルなど）ごとに分別して捨てます。",
        translationId: "Sampah dibuang dengan dipilah sesuai jenisnya (sampah bakar, non-bakar, botol plastik, dll).",
        options: ["○（正しい / Benar）", "×（誤り / Salah）"],
        correctAnswerIndex: 0,
        explanationJa: "正解は「○」です。自治体や寮の分別ルールを守って正しくごみを捨てる必要があります。",
        explanationId: "Benar (○). Pemilahan sampah sangat ketat di Jepang dan wajib dipatuhi sesuai jadwal dan kategori tempat tinggal.",
      },
    ],
  },
]

export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED"

export interface AttendanceRecord {
  id: string
  studentId: string
  status: AttendanceStatus
  note?: string
}

export interface AttendanceSession {
  id: string
  cohortId: string
  date: string
  lessonTitle: string
  period?: string
  instructorId: string
  instructorName?: string
  location?: string
  records: AttendanceRecord[]
  createdAt: string
}

export const INITIAL_ATTENDANCE_SESSIONS: AttendanceSession[] = [
  {
    id: "session-1",
    cohortId: "cohort-1",
    date: "2026-04-05",
    lessonTitle: "第1課 日本語基礎挨拶と自己紹介",
    period: "午前 09:00 - 12:00",
    instructorId: "user-s1",
    instructorName: "田中 晶子 (Tanaka Akiko)",
    location: "本館 201講義室",
    createdAt: "2026-04-05",
    records: [
      { id: "att-1-1", studentId: "user-g1", status: "PRESENT" },
      { id: "att-1-2", studentId: "user-g2", status: "PRESENT" },
      { id: "att-1-3", studentId: "user-g3", status: "PRESENT" },
      { id: "att-1-4", studentId: "user-g4", status: "PRESENT" },
      { id: "att-1-5", studentId: "user-g5", status: "PRESENT" },
    ],
  },
  {
    id: "session-2",
    cohortId: "cohort-1",
    date: "2026-04-06",
    lessonTitle: "第2課 ひらがな・カタカナ表記と文字テスト",
    period: "午前 09:00 - 12:00",
    instructorId: "user-s2",
    instructorName: "渡辺 浩 (Watanabe Hiroshi)",
    location: "本館 202講義室",
    createdAt: "2026-04-06",
    records: [
      { id: "att-2-1", studentId: "user-g1", status: "PRESENT" },
      { id: "att-2-2", studentId: "user-g2", status: "LATE", note: "電車遅延のため10分遅れ / Keterlambatan kereta 10 menit" },
      { id: "att-2-3", studentId: "user-g3", status: "PRESENT" },
      { id: "att-2-4", studentId: "user-g4", status: "PRESENT" },
      { id: "att-2-5", studentId: "user-g5", status: "EXCUSED", note: "大使館手続きのため公欠 / Izin urusan kedutaan" },
    ],
  },
  {
    id: "session-3",
    cohortId: "cohort-1",
    date: "2026-04-07",
    lessonTitle: "第3課 数字・時間・日常表現の会話演習",
    period: "午後 13:00 - 16:00",
    instructorId: "user-s1",
    instructorName: "田中 晶子 (Tanaka Akiko)",
    location: "本館 201講義室",
    createdAt: "2026-04-07",
    records: [
      { id: "att-3-1", studentId: "user-g1", status: "PRESENT" },
      { id: "att-3-2", studentId: "user-g2", status: "PRESENT" },
      { id: "att-3-3", studentId: "user-g3", status: "PRESENT" },
      { id: "att-3-4", studentId: "user-g4", status: "PRESENT" },
      { id: "att-3-5", studentId: "user-g5", status: "PRESENT" },
    ],
  },
]

// ==========================================
// Assignments & Submissions Data
// ==========================================

export type AssignmentFormat = "TEXT" | "FILE" | "URL"
export type SubmissionStatus = "PENDING" | "SUBMITTED" | "GRADED" | "LATE"

export interface Assignment {
  id: string
  cohortId: string
  title: string
  description: string
  japanesePrompt: string
  targetLevel: string
  dueDate: string // YYYY-MM-DD HH:mm
  format: AssignmentFormat
  maxScore: number
  passScore: number
  instructorId: string
  instructorName: string
  createdAt: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  content: string
  submittedAt?: string
  status: SubmissionStatus
  score?: number
  feedback?: string
  gradedAt?: string
  gradedBy?: string
}

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-1",
    cohortId: "cohort-1",
    title: "第1週: 自己紹介の作文 (Self-Introduction Essay)",
    description: "これまでの学歴、日本留学の目的、将来の夢について日本語で200字〜400字程度の作文を書いてください。(Tulis esai perkenalan diri 200-400 karakter bahasa Jepang mengenai latar belakang, tujuan studi, dan cita-cita.)",
    japanesePrompt: "【{課題|かだい}】{自己|じこ}{紹介|しょうかい}の{作文|さくぶん}\nこれまでの{学歴|がくれき}、日本への{留学|りゅうがく}を{志望|しぼう}した{理由|りゆう}、そして{将来|しょうらい}の{夢|ゆめ}について、{丁寧語|ていねいご}（〜です・〜ます）を{使|つか}って200{字|じ}〜400{字|じ}で{書|か}いてください。",
    targetLevel: "N5",
    dueDate: "2026-04-12 23:59",
    format: "TEXT",
    maxScore: 100,
    passScore: 70,
    instructorId: "user-s1",
    instructorName: "田中 晶子 (Tanaka Akiko)",
    createdAt: "2026-04-02",
  },
  {
    id: "asg-2",
    cohortId: "cohort-1",
    title: "ビジネス敬語メールの作成 (Business Keigo Email Writing)",
    description: "担当教員または受け入れ先大学の教授に対して、面談を依頼する正式なメールを作成してください。(Tulis draf email permohonan janji temu kepada profesor pembimbing menggunakan bahasa Jepang formal.)",
    japanesePrompt: "【{課題|かだい}】{教授|きょうじゅ}への{面談|めんだん}{依頼|いらい}メール\n{来週|らいしゅう}の{火曜日|かようび}または{木曜日|もくようび}に{研究|けんきゅう}{計画|けいかく}の{相談|そうだん}をするため、{大学|だいがく}の{指導|しどう}{教授|きょうじゅ}に{面談|めんだん}を{依頼|いらい}するメールを{敬語|けいご}を{正|ただ}しく{用|もち}いて{作成|さくせい}してください。",
    targetLevel: "N4",
    dueDate: "2026-04-20 23:59",
    format: "TEXT",
    maxScore: 100,
    passScore: 75,
    instructorId: "user-s1",
    instructorName: "田中 晶子 (Tanaka Akiko)",
    createdAt: "2026-04-08",
  },
  {
    id: "asg-3",
    cohortId: "cohort-1",
    title: "週末の予定と日本文化体験 (Weekend Plans & Japanese Culture)",
    description: "週末に体験したい日本文化（茶道、神社参拝、日本食など）について短文を作成してください。(Tulis rencana akhir pekan dan pengalaman budaya Jepang yang ingin dicoba.)",
    japanesePrompt: "【{課題|かだい}】{週末|しゅうまつ}の{予定|よてい}と{体験|たいけん}したい{日本文化|にほんぶんか}\n{週末|しゅうまつ}にどこへ{行|い}って、どのような{日本文化|にほんぶんか}を{体験|たいけん}したいか、{接続詞|せつぞくし}（そして、それから、でも）を{使|つか}って{表現|ひょうげん}してください。",
    targetLevel: "N5",
    dueDate: "2026-05-01 23:59",
    format: "TEXT",
    maxScore: 100,
    passScore: 70,
    instructorId: "user-s2",
    instructorName: "渡辺 浩 (Watanabe Hiroshi)",
    createdAt: "2026-04-15",
  },
]

export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: "sub-1-1",
    assignmentId: "asg-1",
    studentId: "user-g1",
    content: "初めまして。私の名前はブディ・セティアワンと申します。インドネシアのバンドンから来ました。バンドン工科大学で情報工学を勉強しました。日本への留学を志望した理由は、世界最先端のロボット工学とAI技術を学びたいからです。将来の夢は、インドネシアと日本の架け橋となるエンジニアになることです。どうぞよろしくお願いいたします。",
    submittedAt: "2026-04-10 14:30",
    status: "GRADED",
    score: 92,
    feedback: "非常に論理的で丁寧な日本語です。「〜と申します」の謙譲表現も正しく使えています。この調子で頑張りましょう！ (Bahasa Jepang sangat baik dan santun. Penggunaan ungkapan formal sudah tepat!)",
    gradedAt: "2026-04-11 10:00",
    gradedBy: "田中 晶子 (Tanaka Akiko)",
  },
  {
    id: "sub-1-2",
    assignmentId: "asg-1",
    studentId: "user-g2",
    content: "初めまして。シティ・ヌルハリザです。ジャカルタ出身です。日本文学と日本語教育に興味があります。日本の大学で言語学を深く研究したいです。将来はインドネシアで日本語の先生になりたいです。一生懸命頑張ります。よろしくお願いします。",
    submittedAt: "2026-04-11 18:45",
    status: "SUBMITTED",
  },
  {
    id: "sub-1-3",
    assignmentId: "asg-1",
    studentId: "user-g3",
    content: "こんにちは。リズキ・プラタマです。スラバヤから来ました。機械工学を専攻しています。新幹線や日本のものづくりの精神に憧れています。日本で先端技術を学び、国の発展に貢献したいです。よろしくおねがいします。",
    submittedAt: "2026-04-10 20:15",
    status: "GRADED",
    score: 85,
    feedback: "将来の目標が明確で素晴らしいです。「よろしくおねがいします」は漢字で「よろしくお願いいたします」と書くとさらに印象が良くなります。",
    gradedAt: "2026-04-11 11:20",
    gradedBy: "田中 晶子 (Tanaka Akiko)",
  },
]

export type ExamStatus = "ACTIVE" | "UPCOMING" | "CLOSED"

export interface ExamQuestion {
  id: string
  prompt: string
  promptPlain: string
  options: string[]
  correctAnswerIndex: number
  explanationJa: string
  explanationId: string
  translationId?: string
  points: number
}

export interface Exam {
  id: string
  cohortId: string
  title: string
  description?: string
  targetLevel: "N5" | "N4" | "N3" | "N2" | "N1"
  durationMinutes: number
  passScore: number
  allowFurigana: boolean
  status: ExamStatus
  questions: ExamQuestion[]
  createdAt: string
  instructorId: string
  instructorName?: string
}

export interface ExamAttempt {
  id: string
  examId: string
  studentId: string
  answers: Record<string, number>
  flaggedQuestionIds: string[]
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  timeSpentSeconds: number
  submittedAt: string
}

export const INITIAL_EXAMS: Exam[] = [
  {
    id: "exam-1",
    cohortId: "cohort-1",
    title: "JLPT N5 模擬試験: 第1回 総合判定テスト",
    description: "N5レベルの語彙・文法・読解を含む総合模擬試験です。本番同様の試験時間と判定基準で実施します。(Ujian simulasi komprehensif JLPT N5 mencakup kosakata, tata bahasa, dan pemahaman bacaan.)",
    targetLevel: "N5",
    durationMinutes: 25,
    passScore: 70,
    allowFurigana: false,
    status: "ACTIVE",
    createdAt: "2026-04-05",
    instructorId: "user-s1",
    instructorName: "田中 晶子 (Tanaka Akiko)",
    questions: [
      {
        id: "eq-1-1",
        prompt: "毎朝、パンとコーヒー（　　）食べます。",
        promptPlain: "毎朝、パンとコーヒー（　　）食べます。",
        translationId: "Setiap pagi, saya makan roti dan kopi.",
        options: ["を", "に", "で", "が"],
        correctAnswerIndex: 0,
        explanationJa: "「パンとコーヒー」という飲食の対象（目的語）を表す助詞は「を」です。",
        explanationId: "Partikel 'を' (o) digunakan untuk menandai objek penderita dari kata kerja makan/minum.",
        points: 20,
      },
      {
        id: "eq-1-2",
        prompt: "きのう、図書館で友だち（　　）会いました。",
        promptPlain: "きのう、図書館で友だち（　　）会いました。",
        translationId: "Kemarin, saya bertemu teman di perpustakaan.",
        options: ["を", "に", "へ", "で"],
        correctAnswerIndex: 1,
        explanationJa: "「会う（あう）」の相手を表す助詞は「に」を使います（友だちに会う）。",
        explanationId: "Kata kerja '会う' (bertemu) berpasangan dengan partikel 'に' (ni) untuk orang yang ditemui.",
        points: 20,
      },
      {
        id: "eq-1-3",
        prompt: "この教室はとても（　　）ですね。",
        promptPlain: "この教室はとても（　　）ですね。",
        translationId: "Ruang kelas ini sangat luas ya.",
        options: ["ひろい", "ひろくて", "ひろく", "ひろさ"],
        correctAnswerIndex: 0,
        explanationJa: "文末で「〜ですね」に直接接続する場合、い形容詞の辞書形（ひろい）を用います。",
        explanationId: "Bentuk dasar kata sifat-i (ひろい - luas) digunakan langsung sebelum 'ですね'.",
        points: 20,
      },
      {
        id: "eq-1-4",
        prompt: "駅までバスで（　　）かかりますか。",
        promptPlain: "駅までバスで（　　）かかりますか。",
        translationId: "Berapa lama waktu yang dibutuhkan naik bus sampai ke stasiun?",
        options: ["なんじ", "どのくらい", "いくら", "どうして"],
        correctAnswerIndex: 1,
        explanationJa: "所要時間（かかる時間）を尋ねる疑問詞は「どのくらい」です。",
        explanationId: "'どのくらい' (dono kurai) digunakan untuk menanyakan durasi/lama waktu.",
        points: 20,
      },
      {
        id: "eq-1-5",
        prompt: "【読解】田中さんは毎朝7時に起きます。シャワーを浴びて、朝ごはんを食べます。それから8時に電車で大学へ行きます。\n質問: 田中さんは起きてから何時に大学へ向かいますか。",
        promptPlain: "【読解】田中さんは毎朝7時に起きます。シャワーを浴びて、朝ごはんを食べます。それから8時に電車で大学へ行きます。\n質問: 田中さんは起きてから何時に大学へ向かいますか。",
        translationId: "[Bacaan] Tanaka-san bangun jam 7 setiap pagi. Mandi dan sarapan. Kemudian jam 8 pergi ke universitas naik kereta. Pertanyaan: Jam berapa Tanaka-san berangkat ke kampus?",
        options: ["7時", "7時半", "8時", "8時半"],
        correctAnswerIndex: 2,
        explanationJa: "本文に「それから8時に電車で大学へ行きます」とあるため、正解は「8時」です。",
        explanationId: "Teks menyebutkan 'それから8時に電車で大学へ行きます', sehingga jawabannya adalah jam 8 (8時).",
        points: 20,
      },
    ],
  },
  {
    id: "exam-2",
    cohortId: "cohort-1",
    title: "JLPT N4 プレテスト: 敬語・文法力診断テスト",
    description: "N4レベルで頻出する敬語表現、条件表現、授受表現の理解度を診断するテストです。(Tes evaluasi pemahaman keigo, kalimat pengandaian, dan ungkapan memberi-menerima tingkat N4.)",
    targetLevel: "N4",
    durationMinutes: 30,
    passScore: 75,
    allowFurigana: true,
    status: "ACTIVE",
    createdAt: "2026-04-12",
    instructorId: "user-s2",
    instructorName: "渡辺 浩 (Watanabe Hiroshi)",
    questions: [
      {
        id: "eq-2-1",
        prompt: "先生、先生の新しい本をもう（　　）。",
        promptPlain: "先生、先生の新しい本をもう（　　）。",
        translationId: "Sensei, apakah Anda sudah membaca buku baru karya Sensei?",
        options: ["読みましたか", "お読みになりましたか", "拝読しましたか", "読まれました"],
        correctAnswerIndex: 1,
        explanationJa: "先生の行為に対して敬意を表すため、尊敬語「お読みになりましたか」が適切です。「拝読」は謙譲語です。",
        explanationId: "Untuk tindakan Sensei, gunakan sonkeigo 'お読みになりましたか'. '拝読しました' adalah kenjougo (merendahkan diri sendiri).",
        points: 20,
      },
      {
        id: "eq-2-2",
        prompt: "雨が（　　）、ピクニックは中止になります。",
        promptPlain: "雨が（　　）、ピクニックは中止になります。",
        translationId: "Kalau hujan turun, piknik akan dibatalkan.",
        options: ["降ったら", "降ると", "降れば", "降るなら"],
        correctAnswerIndex: 0,
        explanationJa: "日常会話で確定的な条件（もし雨が降った場合）には「〜たら（降ったら）」が最も自然です。",
        explanationId: "Bentuk conditional '~tara' (降ったら) paling umum dan tepat untuk kondisi pengandaian rencana di masa depan.",
        points: 20,
      },
      {
        id: "eq-2-3",
        prompt: "友だちが私の誕生日に素敵な時計を（　　）。",
        promptPlain: "友だちが私の誕生日に素敵な時計を（　　）。",
        translationId: "Teman saya memberi saya jam tangan yang bagus pada hari ulang tahun saya.",
        options: ["あげました", "くれました", "もらいました", "やりました"],
        correctAnswerIndex: 1,
        explanationJa: "第三者（友だち）が私に対して物をくれたときは「くれました」を使います。",
        explanationId: "Ketika orang lain memberi kepada saya/pihak pembicara, gunakan 'くれました' (kuremashita).",
        points: 20,
      },
      {
        id: "eq-2-4",
        prompt: "薬を飲んだ（　　）、熱がまだ下がりません。",
        promptPlain: "薬を飲んだ（　　）、熱がまだ下がりません。",
        translationId: "Padahal sudah minum obat, tapi demamnya belum juga turun.",
        options: ["ので", "のに", "から", "ため"],
        correctAnswerIndex: 1,
        explanationJa: "予想と反対の結果に対する不満や逆接を表す表現は「のに（〜のに）」です。",
        explanationId: "'〜のに' (noni) berarti 'padahal / meskipun', menyatakan pertentangan dengan rasa heran/kecewa.",
        points: 20,
      },
      {
        id: "eq-2-5",
        prompt: "【長文読解】留学生センターの規則によると、寮の門限は午後10時です。もし遅れる場合は、必ず事前に管理人室へ連絡しなければなりません。連絡がない場合、翌週の外出が制限されることがあります。\n質問: 門限に遅れるとき、留学生は何をしなければなりませんか。",
        promptPlain: "【長文読解】留学生センターの規則によると、寮の門限は午後10時です。もし遅れる場合は、必ず事前に管理人室へ連絡しなければなりません。連絡がない場合、翌週の外出が制限されることがあります。\n質問: 門限に遅れるとき、留学生は何をしなければなりませんか。",
        translationId: "[Bacaan] Menurut tata tertib asrama, jam malam adalah pukul 22:00. Jika terlambat, wajib menghubungi kantor pengelola sebelumnya. Pertanyaan: Apa yang wajib dilakukan mahasiswa jika terlambat?",
        options: ["翌週外出しない", "事前に管理人室へ連絡する", "友だちに鍵を頼む", "夜10時までに帰る"],
        correctAnswerIndex: 1,
        explanationJa: "「もし遅れる場合は、必ず事前に管理人室へ連絡しなければなりません」と記載されています。",
        explanationId: "Teks dengan jelas menyatakan kewajiban menghubungi kantor pengelola asrama terlebih dahulu ('事前に管理人室へ連絡する').",
        points: 20,
      },
    ],
  },
]

export const INITIAL_EXAM_ATTEMPTS: ExamAttempt[] = [
  {
    id: "att-ex-1-1",
    examId: "exam-1",
    studentId: "user-g1",
    answers: {
      "eq-1-1": 0,
      "eq-1-2": 1,
      "eq-1-3": 0,
      "eq-1-4": 1,
      "eq-1-5": 2,
    },
    flaggedQuestionIds: ["eq-1-5"],
    score: 100,
    maxScore: 100,
    percentage: 100,
    passed: true,
    timeSpentSeconds: 1140, // 19m
    submittedAt: "2026-04-10 15:45",
  },
  {
    id: "att-ex-1-3",
    examId: "exam-1",
    studentId: "user-g3",
    answers: {
      "eq-1-1": 0,
      "eq-1-2": 1,
      "eq-1-3": 1, // incorrect (chose ひろくて)
      "eq-1-4": 1,
      "eq-1-5": 2,
    },
    flaggedQuestionIds: [],
    score: 80,
    maxScore: 100,
    percentage: 80,
    passed: true,
    timeSpentSeconds: 1320, // 22m
    submittedAt: "2026-04-10 16:10",
  },
]


